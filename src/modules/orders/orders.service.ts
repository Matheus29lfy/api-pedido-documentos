import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Exam } from '../exams/entities/exam.entity';
import { ExamsService } from '../exams/exams.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,

    @Inject(forwardRef(() => ExamsService))
    private readonly examsService: ExamsService,
  ) {}

async createOrUpdate(orderDto: any): Promise<Order> {
  // 1. Busca inicial
  const existingOrder = await this.orderRepository.findOne({
    where: { CodigoPedido: orderDto.CodigoPedido },
    relations: ['Exames'],
  });

  let order: Order;

  if (existingOrder) {
    order = existingOrder;
    
    // Inicializa o array se estiver nulo
    if (!order.Exames) order.Exames = [];

    // Filtra exames que já não existam no pedido
    const newExams = orderDto.Exames.filter(
      (dtoExam: any) => !order.Exames.some(
        (dbExam) => dbExam.CodigoltemPedido === dtoExam.CodigoltemPedido
      )
    );

    if (newExams.length > 0) {
      const examsToSave = newExams.map((e: any) => 
        this.examRepository.create({ ...e, order })
      );
      order.Exames.push(...examsToSave);
    }
  } else {
      // Forçamos o retorno a ser tratado como um objeto único (Order)
      order = this.orderRepository.create({
        ...orderDto,
        integrado: false,
      } as Order);
    // Garante que a lista de exames vinda do DTO seja convertida em entidades
    if (orderDto.Exames) {
        order.Exames = orderDto.Exames.map((e: any) => this.examRepository.create({ ...e }));
    }
  }

  // 3. Regra de Negócio: Integração
  if (order.Exames && order.Exames.length > 0) {
    for (const exam of order.Exames) {
      const existsInSystem = await this.examsService.findByAccession(exam.AccessionNumber);
      if (existsInSystem) {
        order.integrado = true;
        break;
      }
    }
  }

  // 4. Retorno com Cast Explícito para evitar erro TS2322 (Array vs Object)
  const savedOrder = await this.orderRepository.save(order);
  return savedOrder as Order;
}
  async findOne(codigoPedido: number): Promise<Order | null> {
    return await this.orderRepository.findOne({ 
      where: { CodigoPedido: codigoPedido },
      relations: ['Exames'] 
    });
  }

  // Método auxiliar necessário para a integração quando o exame chega primeiro
  async findByAccession(accessionNumber: string): Promise<Order | null> {
    return await this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.Exames', 'exam')
      .where('exam.AccessionNumber = :accessionNumber', { accessionNumber })
      .getOne();
  }
}