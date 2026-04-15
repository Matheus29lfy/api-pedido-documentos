import { Injectable, ConflictException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @Inject(forwardRef(() => OrdersService)) // Use o forwardRef aqui
    private readonly ordersService: OrdersService,
  ) {}

  async create(docDto: any) {
    // Regra: Não permitir duplicado (CodigoDocumento + CodigoPedido) 
    const duplicate = await this.documentRepository.findOne({
      where: {
        CodigoDocumento: docDto.CodigoDocumento,
        CodigoPedido: docDto.CodigoPedido,
      },
    });

    if (duplicate) {
      // Resultado esperado: retorno de erro de duplicidade [cite: 104]
      throw new ConflictException('Documento já cadastrado para este pedido.');
    }

    const order = await this.ordersService.findOne(docDto.CodigoPedido);
    
    // Se o pedido relacionado já estiver integrado, o documento deve ser marcado como integrado: true [cite: 75, 76]
    const isIntegrated = order ? order.integrado : false;

    const newDoc = this.documentRepository.create({
      ...docDto,
      integrado: isIntegrated,
    });

    return await this.documentRepository.save(newDoc);
  }

  async findPendingByOrder(codigoPedido: number) {
    // Busca documentos salvos, mas ainda não vinculados ao exame [cite: 98]
    return await this.documentRepository.find({
      where: {
        CodigoPedido: codigoPedido,
        integrado: false,
      },
    });
  }

  async markAsIntegrated(codigoPedido: number) {
    // Regra: Documento é vinculado quando o exame referente ao pedido chega [cite: 100]
    await this.documentRepository.update(
      { CodigoPedido: codigoPedido },
      { integrado: true }
    );
  }
}