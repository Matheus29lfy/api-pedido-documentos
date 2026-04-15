import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('exam_arrivals')
export class ExamArrival {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  AccessionNumber: string;

  @CreateDateColumn()
  arrivalAt: Date;
}