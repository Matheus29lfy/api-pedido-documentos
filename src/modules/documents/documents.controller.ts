import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('documentos')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() docDto: CreateDocumentDto) {
    return this.documentsService.createDocument(docDto);
  }

  @Get(':codigoPedido')
  findByOrder(@Param('codigoPedido', ParseIntPipe) codigoPedido: number) {
    return this.documentsService.findPendingByOrder(codigoPedido);
  }
   
  @Get()
  async findAll() {
    return this.documentsService.findAll(); // Crie esse método no service se precisar
  }
}