import { Injectable, Inject, forwardRef, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Exam } from '../exams/entities/exam.entity';
import { ExamsService } from '../exams/exams.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @Inject(forwardRef(() => ExamsService))
    private readonly examsService: ExamsService,
    @Inject(forwardRef(() => DocumentsService)) 
    private docsService: any,
  ) {}

  async createOrUpdate(orderDto: any) {
  const existingOrder = await this.orderRepository.findOne({
    where: { CodigoPedido: orderDto.CodigoPedido },
    relations: ['Exames'],
  });

  try {
    if (existingOrder) {
      // 1. Filtro de exames (Corrigido typo de CodigoItemPedido)
      const newExams = orderDto.Exames.filter(
        (dto) => !existingOrder.Exames.some(db => db.CodigoItemPedido === dto.CodigoItemPedido)
      );

      if (newExams.length === 0 && existingOrder.integrado) {
        return { message: "Pedido já processado e sem novos exames.", data: this.minimizeResponse(existingOrder), changed: false };
      }

      const examsToSave = newExams.map(e => this.examRepository.create({ ...e, order: existingOrder }));
      existingOrder.Exames.push(...examsToSave);
      
      // Regra 2: Verifica integração (se algum Accession já existe no sistema)
      existingOrder.integrado = await this.checkIntegration(orderDto.Exames);

      const saved = await this.orderRepository.save(existingOrder);

      // Gatilho Regra 4: Se integrou agora, vincula docs pendentes
      if (saved.integrado) {
        await this.docsService.linkPendingDocuments(saved.CodigoPedido);
      }

      return { 
        message: "Pedido atualizado com sucesso.",
        data: this.minimizeResponse(saved), 
        changed: true 
      };
    }

    // --- Fluxo de Novo Pedido ---
    const order = this.orderRepository.create({ ...orderDto, integrado: false } as Order);
    order.Exames = orderDto.Exames.map(e => this.examRepository.create({ ...e, order }));
    
    // Regra 2: Verifica integração na criação
    order.integrado = await this.checkIntegration(orderDto.Exames);
    
    const saved = await this.orderRepository.save(order);

    // Gatilho Regra 4: Importante se o exame chegou ANTES do pedido
    if (saved.integrado) {
      await this.docsService.linkPendingDocuments(saved.CodigoPedido);
    }

    return { 
      message: "Pedido criado com sucesso.",
      data: this.minimizeResponse(saved), 
      isNew: true 
    };

  } catch (error) {
  // Erro de Unicidade no Postgres (23505)
    if (error.code === '23505') {
      const detail = error.detail || '';

      // Verifica se o erro foi no AccessionNumber
      if (detail.includes('AccessionNumber')) {
        throw new ConflictException('Um dos AccessionNumbers enviados já pertence a outro pedido.');
      }

      // Verifica se o erro foi na Chave Primária (caso CodigoItemPedido ainda seja PrimaryColumn)
      if (detail.includes('CodigoItemPedido') || detail.includes('pk_exams')) {
        throw new ConflictException('O CodigoItemPedido já existe para este registro no banco.');
      }
      
      throw new ConflictException('Conflito de duplicidade nos dados enviados.');
    }

    throw error;
    }
}

  // Método privado para limpar o JSON de retorno e evitar recursão
  private minimizeResponse(order: Order) {
    return {
      CodigoPedido: order.CodigoPedido,
      NomePaciente: order.NomePaciente,
      integrado: order.integrado,
      Exames: order.Exames.map(ex => ({
        CodigoItemPedido: ex.CodigoItemPedido,
        AccessionNumber: ex.AccessionNumber,
        Modalidade: ex.Modalidade,
        NomeProcedimento: ex.NomeProcedimento
      }))
    };
  }

  private async checkIntegration(exames: any[]): Promise<boolean> {
    const accessions = exames.map(e => e.AccessionNumber);
    return await this.examsService.existsMany(accessions);
  }

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

  async updateIntegrationStatus(codigoPedido: number, status: boolean) {
  await this.orderRepository.update({ CodigoPedido: codigoPedido }, { integrado: status });
}
}