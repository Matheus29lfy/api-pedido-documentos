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
    return await this.documentRepository.find();
  }

  async findPendingByOrder(codigoPedido: number) {
    const documents = await this.documentRepository.find({
      where: { CodigoPedido: codigoPedido, integrado: false },
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
      { CodigoPedido: codigoPedido, integrado: false },
      { integrado: true }
    );
  }
}
// @Injectable()
// export class DocumentsService {
//   constructor(
//     @InjectRepository(Document)
//     private readonly documentRepository: Repository<Document>,
//     @Inject(forwardRef(() => OrdersService)) // Use o forwardRef aqui
//     private readonly ordersService: OrdersService,
//   ) {}

// async createDocument(docDto: any) {
//   // Regra 3: Validação de duplicidade (CodigoDocumento + CodigoPedido)
//   const existingDoc = await this.documentRepository.findOne({
//     where: { 
//       CodigoDocumento: docDto.CodigoDocumento, 
//       CodigoPedido: docDto.CodigoPedido 
//     }
//   });

//   if (existingDoc) {
//     throw new ConflictException('Documento duplicado para este pedido.'); // Retorna 409
//   }

//   const order = await this.ordersService.findOne(docDto.CodigoPedido);

//   const document = this.documentRepository.create({
//     ...docDto,
//     integrado: order?.integrado || false // Regra 3: Se já integrado, marca o doc como integrado
//   });

//   return await this.documentRepository.save(document);
// }

//   async findPendingByOrder(codigoPedido: number) {
//     // Busca documentos salvos, mas ainda não vinculados ao exame [cite: 98]
//      const document = await this.documentRepository.find({
//       where: {
//         CodigoPedido: codigoPedido,
//         integrado: false,
//       },
//     });

//    if (document.length === 0) {
//       // Lança o erro 404 automaticamente
//       throw new NotFoundException(`Documento com Código ${codigoPedido} não encontrado.`);
//     }
//     return document;
//   }

//     async findAll(): Promise<Document[]> { // Altere de Order | null para Order[]
//           const documents = await this.documentRepository.find({
//       });

//       if (documents.length === 0) {
//             // Lança o erro 404 automaticamente
//             throw new NotFoundException(`Não há documentos cadastrados.`);
//           }

//       return documents;
//     }

//   async markAsIntegrated(codigoPedido: number) {
//     // Regra: Documento é vinculado quando o exame referente ao pedido chega [cite: 100]
//     await this.documentRepository.update(
//       { CodigoPedido: codigoPedido },
//       { integrado: true }
//     );
//   }

//   async linkPendingDocuments(codigoPedido: number) {
//   // Regra 4: Documentos pendentes passam a ser integrados: true
//   await this.documentRepository.update(
//     { CodigoPedido: codigoPedido, integrado: false },
//     { integrado: true }
//   );
// }
// }