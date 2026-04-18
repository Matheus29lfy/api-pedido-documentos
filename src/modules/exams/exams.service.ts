import { Injectable, Inject, forwardRef, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { DocumentsService } from '../documents/documents.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { In, Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { CreateExamDto } from './dto/create-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examsRepository: Repository<Exam>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(forwardRef(() => OrdersService)) private ordersService: any,
    @Inject(forwardRef(() => DocumentsService)) private docsService: any,
  ) {}
   
async processArrival(dto: CreateExamDto) {
  try {
    // 1. Tenta achar o exame pelo AccessionNumber
    let exam = await this.examsRepository.findOne({
      where: { AccessionNumber: dto.AccessionNumber },
      relations: ['order']
    });

    if (exam && exam.order) {
      // CENÁRIO JÁ EXISTENTE: Segue a Regra 4
      const order = exam.order;
      
      if (!order.integrado) {
        order.integrado = true;
        await this.orderRepository.save(order);
      }

      await this.docsService.linkPendingDocuments(order.CodigoPedido);
      
      return { 
        message: "Exame processado e pedido integrado com sucesso.",
        status: "integrated" 
      };
    } else {
      // CENÁRIO NOVO: Exame chegou antes do pedido ou pedido não vinculado
      // Nota: Se a coluna CodigoPedido for NOT NULL no banco, o save abaixo vai falhar.
      const newExam = this.examsRepository.create({
        ...dto,
      });

      await this.examsRepository.save(newExam);
      
      return { 
        message: "Exame registrado. Aguardando chegada do pedido correspondente para integração.",
        status: "pending_order"
      };
    }
  } catch (error) {
    // Tratamento de erro de constraint do Postgres (Not Null ou Duplicidade)
    if (error.code === '23502') { // Erro de Not Null
      throw new BadRequestException(
        `Não é possível registrar o exame sem um pedido vinculado. Verifique se o CodigoPedido foi enviado.`
      );
    }

    if (error.code === '23505') { // Erro de Unique (AccessionNumber já existe)
      throw new ConflictException(`O AccessionNumber ${dto.AccessionNumber} já está registrado no sistema.`);
    }

    // Erro genérico para não expor detalhes do banco (Log interno)
    console.error('Erro ao processar chegada de exame:', error);
    throw new InternalServerErrorException('Ocorreu um erro interno ao processar o exame.');
  }
}
  async findOne(accessionNumber: string): Promise<Exam | null> {
      const exam = await this.examsRepository.findOne({ 
      where: { AccessionNumber: accessionNumber },
    });

     if (!exam) {
      // Lança o erro 404 automaticamente
      throw new NotFoundException(`Exame com Número de Acesso ${accessionNumber} não encontrado.`);
    }
  
    return exam;
  }

   async findAll(): Promise<Exam[]> { // Altere de Order | null para Order[]
       const exams = await this.examsRepository.find();
      if (exams.length === 0) {
        throw new NotFoundException(`Não há exames cadastrados.`);
      }
      return exams
    }


  async existsMany(accessions: string[]): Promise<boolean> {
  const count = await this.examsRepository.count({
    where: { AccessionNumber: In(accessions) }
  });
  return count > 0;
}
}