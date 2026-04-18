import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsService } from './exams.service';
import { Exam } from './entities/exam.entity';
import { OrdersModule } from '../orders/orders.module';
import { DocumentsModule } from '../documents/documents.module';
import { ExamsController } from './exams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam]),
    forwardRef(() => OrdersModule),
    forwardRef(() => DocumentsModule),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}