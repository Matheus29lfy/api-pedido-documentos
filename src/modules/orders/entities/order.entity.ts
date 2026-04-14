import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Exam } from '../../exams/entities/exam.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  CodigoPedido: number; // Identificador único do pedido [cite: 54]

  @Column()
  NomePaciente: string;

  @Column({ default: false })
  integrado: boolean; // Status de integração [cite: 65]

  @OneToMany(() => Exam, (exam) => exam.order, { cascade: true })
  Exames: Exam[];
}