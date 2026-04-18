import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { DocumentsService } from '../documents/documents.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examsRepository: Repository<Exam>,
    @Inject(forwardRef(() => OrdersService)) private ordersService: any,
    @Inject(forwardRef(() => DocumentsService)) private docsService: any,
  ) {}
   
  async findOne(accessionNumber: string): Promise<Exam | null> {
      const exam = await this.examsRepository.findOne({ 
      where: { AccessionNumber: accessionNumber },
    });

     if (!exam) {
      // Lança o erro 404 automaticamente
      throw new NotFoundException(`Exame com Número de Acesso ${accessionNumber} não encontrado.`);
    }
  
    return exam;
  }

   async findAll(): Promise<Exam[]> { // Altere de Order | null para Order[]
       const exams = await this.examsRepository.find();
      if (exams.length === 0) {
        throw new NotFoundException(`Não há exames cadastrados.`);
      }
      return exams
    }


  async existsMany(accessions: string[]): Promise<boolean> {
  const count = await this.examsRepository.count({
    where: { AccessionNumber: In(accessions) }
  });
  return count > 0;
}
}