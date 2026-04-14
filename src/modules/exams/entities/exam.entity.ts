import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('exams')
export class Exam {
  @PrimaryColumn()
  CodigoltemPedido: number;

  @Index() // Indexado para otimizar a busca por AccessionNumber [cite: 63, 89]
  @Column()
  AccessionNumber: string;

  @Column()
  Modalidade: string; 

  @Column()
  NomeProcedimento: string;

  @Column({ nullable: true })
  Status: string;

  @Column({ nullable: true })
  NomePaciente: string; 

  // Relacionamento com o Pedido
  @ManyToOne(() => Order, (order) => order.Exames, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'CodigoPedido' })
  order: Order;

  @Column()
  CodigoPedido: number;
}