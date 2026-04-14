import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class ExamsService {
  private exams = [];

  constructor(
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
}