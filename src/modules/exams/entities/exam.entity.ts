import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('exams')
export class Exam {
  // 1. ADICIONE UMA CHAVE PRIMÁRIA REAL
  @PrimaryGeneratedColumn()
  id: number; 

  // 2. MUDE PARA COLUMN (Deixa de ser a identidade do registro)
  @Unique(['CodigoItemPedido', 'CodigoPedido'])
  @PrimaryColumn()
  CodigoItemPedido: number;

  @Index()
  @Unique(['AccessionNumber'])
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