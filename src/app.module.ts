import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../src/modules/orders/orders.module';
import { DocumentsModule } from '../src/modules/documents/documents.module';
import { ExamsModule } from '../src/modules/exams/exams.module';
import { Order } from '../src/modules/orders/entities/order.entity';
import { Exam } from '../src/modules/exams/entities/exam.entity';
import { Document } from '../src/modules/documents/entities/document.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Nome do serviço no docker-compose
      port: 5432,
      username: 'user',
      password: 'pass',
      database: 'med_db',
      entities: [Order, Exam, Document],
      synchronize: true, 
      autoLoadEntities: true, // Adicione isso
      retryAttempts: 10,     // Aumenta as tentativas
      retryDelay: 3000,      // Espera 3 segundos entre elas
    }),
    OrdersModule,
    DocumentsModule,
    ExamsModule,
  ],
})

export class AppModule {}