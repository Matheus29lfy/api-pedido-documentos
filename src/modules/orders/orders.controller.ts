import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('pedidos')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrUpdate(createOrderDto);
  }

  @Get(':codigoPedido')
  findOne(@Param('codigoPedido', ParseIntPipe) codigoPedido: number) {
    return this.ordersService.findOne(codigoPedido);
  }
}