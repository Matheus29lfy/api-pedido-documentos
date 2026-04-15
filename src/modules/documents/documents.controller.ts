import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documentos')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() docDto: any) {
    return this.documentsService.createDocument(docDto);
  }

  @Get(':codigoPedido')
  findByOrder(@Param('codigoPedido', ParseIntPipe) codigoPedido: number) {
    return this.documentsService.findPendingByOrder(codigoPedido);
  }
}