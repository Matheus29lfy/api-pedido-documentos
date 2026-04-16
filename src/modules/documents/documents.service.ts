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
    @Inject(forwardRef(() => OrdersService)) // Use o forwardRef aqui
    private readonly ordersService: OrdersService,
  ) {}

async createDocument(docDto: any) {
  // Regra 3: Validação de duplicidade (CodigoDocumento + CodigoPedido)
  const existingDoc = await this.documentRepository.findOne({
    where: { 
      CodigoDocumento: docDto.CodigoDocumento, 
      CodigoPedido: docDto.CodigoPedido 
    }
  });

  if (existingDoc) {
    throw new ConflictException('Documento duplicado para este pedido.'); // Retorna 409
  }

  const order = await this.ordersService.findOne(docDto.CodigoPedido);

  const document = this.documentRepository.create({
    ...docDto,
    integrado: order?.integrado || false // Regra 3: Se já integrado, marca o doc como integrado
  });

  return await this.documentRepository.save(document);
}

  async findPendingByOrder(codigoPedido: number) {
    // Busca documentos salvos, mas ainda não vinculados ao exame [cite: 98]
     const document = await this.documentRepository.find({
      where: {
        CodigoPedido: codigoPedido,
        integrado: false,
      },
    });

   if (document.length === 0) {
      // Lança o erro 404 automaticamente
      throw new NotFoundException(`Documento com Código ${codigoPedido} não encontrado.`);
    }
    return document;
  }

    async findAll(): Promise<Document[]> { // Altere de Order | null para Order[]
      return await this.documentRepository.find({
      });
    }

  async markAsIntegrated(codigoPedido: number) {
    // Regra: Documento é vinculado quando o exame referente ao pedido chega [cite: 100]
    await this.documentRepository.update(
      { CodigoPedido: codigoPedido },
      { integrado: true }
    );
  }

  async linkPendingDocuments(codigoPedido: number) {
  // Regra 4: Documentos pendentes passam a ser integrados: true
  await this.documentRepository.update(
    { CodigoPedido: codigoPedido, integrado: false },
    { integrado: true }
  );
}
}