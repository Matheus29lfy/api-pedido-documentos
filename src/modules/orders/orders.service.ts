import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
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

  async createOrUpdate(orderDto: any) {
    const existingOrder = await this.orderRepository.findOne({
      where: { CodigoPedido: orderDto.CodigoPedido },
      relations: ['Exames'],
    });

    if (existingOrder) {
      // Regra 1: Adicionar exames somente se ainda não existirem
      const newExams = orderDto.Exames.filter(
        (dto) => !existingOrder.Exames.some(db => db.CodigoltemPedido === dto.CodigoltemPedido)
      );

      // Se não há exames novos, retornamos uma mensagem clara
      if (newExams.length === 0) {
        return { 
          message: "Pedido já existe e não há novos exames para adicionar.",
          changed: false 
        };
      }

      const examsToSave = newExams.map(e => this.examRepository.create({ ...e, order: existingOrder }));
      existingOrder.Exames.push(...examsToSave);
      
      // Regra 2: Verifica se algum dos exames (novos ou antigos) já chegou ao sistema
      existingOrder.integrado = await this.checkIntegration(orderDto.Exames);
            console.log('Criando pedido com exames:', existingOrder);
    return
      const saved = await this.orderRepository.save(existingOrder);
      return { 
        message: "Exames adicionados com sucesso ao pedido existente.",
        data: this.minimizeResponse(saved), 
        changed: true 
      };
    }

    // Novo Pedido
    const order = this.orderRepository.create({ ...orderDto, integrado: false } as Order);
    order.Exames = orderDto.Exames.map(e => this.examRepository.create({ ...e, order }));
    
    // Regra 2: Verifica integração na criação
    order.integrado = await this.checkIntegration(orderDto.Exames);
      console.log('Criando pedido com exames:', order);
    return
    const saved = await this.orderRepository.save(order);
    return { 
      message: "Pedido criado com sucesso.",
      data: this.minimizeResponse(saved), 
      isNew: true 
    };
  }

  // Método privado para limpar o JSON de retorno e evitar recursão
  private minimizeResponse(order: Order) {
    return {
      CodigoPedido: order.CodigoPedido,
      NomePaciente: order.NomePaciente,
      integrado: order.integrado,
      Exames: order.Exames.map(ex => ({
        CodigoltemPedido: ex.CodigoltemPedido,
        AccessionNumber: ex.AccessionNumber,
        Modalidade: ex.Modalidade,
        NomeProcedimento: ex.NomeProcedimento
      }))
    };
  }

  private async checkIntegration(exames: any[]): Promise<boolean> {
    const accessions = exames.map(e => e.AccessionNumber);
    console.log('Verificando integração para accessions:', accessions);
    // IMPORTANTE: Aqui chamamos o service de exames para ver se esses accessions já "chegaram"
    return await this.examsService.existsMany(accessions);
  }

  // ... outros métodos (findOne, findAll, etc)
  async findOne(codigoPedido: number): Promise<Order | null> {
    const order = await this.orderRepository.findOne({ 
    where: { CodigoPedido: codigoPedido },
    relations: ['Exames'] 
  });

  if (!order) {
    // Lança o erro 404 automaticamente
    throw new NotFoundException(`Pedido com Código ${codigoPedido} não encontrado.`);
  }

  return order;
}
  async findAll(): Promise<Order[]> { // Altere de Order | null para Order[]
     const orders = await this.orderRepository.find({
      relations: ['Exames'] // Adicione isso para ver os exames na lista
    });
    if (orders.length === 0) {
      throw new NotFoundException(`Não há pedidos cadastrados.`);
    }
    return orders
  }

  // Método auxiliar necessário para a integração quando o exame chega primeiro
  async findByAccession(accessionNumber: string): Promise<Order | null> {
    return await this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.Exames', 'exam')
      .where('exam.AccessionNumber = :accessionNumber', { accessionNumber })
      .getOne();
  }

  async updateIntegrationStatus(codigoPedido: number, status: boolean) {
  await this.orderRepository.update({ CodigoPedido: codigoPedido }, { integrado: status });
}
}