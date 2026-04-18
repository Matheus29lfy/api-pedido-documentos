import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { DocumentsService } from '../documents/documents.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamArrival } from './entities/exam-arrival.entity';
import { Exam } from './entities/exam.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ExamsService {
  private exams = [];

  constructor(
    @InjectRepository(Exam)
    private readonly examsRepository: Repository<Exam>,
    @Inject(forwardRef(() => OrdersService)) private ordersService: any,
    @Inject(forwardRef(() => DocumentsService)) private docsService: any,
  ) {}

  async receiveExam(examDto: any) {
    this.exams.push(examDto);

    // Regra 4: Ao receber exame, verificar se existe pedido correspondente [cite: 80]
    // Nota: Aqui você buscaria no OrderService pelo AccessionNumber
    const order = await this.ordersService.findByAccession(examDto.AccessionNumber);
    
    if (order) {
      order.integrado = true; 
      // Vincula documentos que estavam pendentes [cite: 82, 100]
      this.docsService.markAsIntegrated(order.CodigoPedido);
    }

    return examDto;
  }

  async findByAccession(accessionNumber: string) {
    return this.exams.find(e => e.AccessionNumber === accessionNumber);
  }

  async handleArrival(order: any) {
    // 1. Registrar a chegada
    // const arrival = this.arrivalRepository.create(arrivalDto);
    // await this.arrivalRepository.save(arrival);

    // // 2. Buscar pedidos que possuem este AccessionNumber
    // const order = await this.ordersService.findByAccession(arrivalDto.AccessionNumber);

    // if (order) {
      // Regra 4: Marcar pedido como integrado
      // await this.ordersService.updateIntegrationStatus(order.CodigoPedido, true);

      // Regra 4: Vincular documentos pendentes para este pedido
      await this.docsService.linkPendingDocuments(order.CodigoPedido);
    // }

    return { message: 'Chegada processada com sucesso', integrated: !!order };
  }

  // Método auxiliar para os outros services consultarem se um accession já chegou
  async exists(accessionNumber: string): Promise<boolean> {
    const count = await this.examsRepository.count({
      where: { AccessionNumber: accessionNumber },
    });
    return count > 0;
  }

  async existsMany(accessions: string[]): Promise<boolean> {
  const count = await this.examsRepository.count({
    where: { AccessionNumber: In(accessions) }
  });
  console.log(`Verificando existência de accessions: ${accessions.join(', ')}. Encontrados: ${count}`);
  return count > 0;
}
}