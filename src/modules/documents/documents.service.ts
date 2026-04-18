import { Injectable, ConflictException, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async createDocument(docDto: any) {
    // Regra 6: Validação de duplicidade
    const existingDoc = await this.documentRepository.findOne({
      where: { 
        CodigoDocumento: docDto.CodigoDocumento, 
        CodigoPedido: docDto.CodigoPedido 
      }
    });

    if (existingDoc) {
      throw new ConflictException('Documento duplicado para este pedido.');
    }

    // Busca o pedido (já trata 404 dentro do ordersService.findOne)
    const order = await this.ordersService.findOne(docDto.CodigoPedido);

    const document = this.documentRepository.create({
      ...docDto,
      // Regra 3: Se o pedido já estiver integrado, o doc também fica
      integrado: order.integrado 
    });

   const savedResult = await this.documentRepository.save(document);
   const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    return {
      message: saved.integrado 
        ? "Documento vinculado aos exames com sucesso." 
        : "Documento salvo. Aguardando chegada do exame para integração.",
      data: saved
    };
  }

  // Ajuste: Retorna array vazio se não houver documentos (Padrão REST)
  async findAll(): Promise<Document[]> {
      const documents = await this.documentRepository.find();
      
    if (documents.length === 0) {
      throw new NotFoundException(`Nenhum documento pendente encontrado para o pedido`);
    }
    return documents;
  }

  async findPendingByOrder(codigoPedido: number) {
    const documents = await this.documentRepository.find({
      where: { CodigoPedido: codigoPedido},
    });

    // Aqui o 404 faz sentido pois é uma busca específica por pedido
    if (documents.length === 0) {
      throw new NotFoundException(`Nenhum documento pendente encontrado para o pedido ${codigoPedido}.`);
    }
    return documents;
  }

  // Centralizado na Regra 4: Chamado quando o exame chega
  async linkPendingDocuments(codigoPedido: number) {
    // Regra 4: Documentos pendentes passam a ser integrados: true
    return await this.documentRepository.update(
      { CodigoPedido: codigoPedido},
      { integrado: true }
    );
  }
}