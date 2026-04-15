import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Exam } from '../exams/entities/exam.entity';
import { ExamsModule } from '../exams/exams.module';
import { forwardRef } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Exam]),
    forwardRef(() => ExamsModule),
    forwardRef(() => DocumentsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}