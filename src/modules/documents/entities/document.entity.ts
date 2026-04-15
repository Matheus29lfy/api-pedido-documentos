import { Entity, Column, PrimaryColumn, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('documents')
@Index(['CodigoDocumento', 'CodigoPedido'], { unique: true }) // Regra de duplicidade [cite: 71, 74]
export class Document {
  @PrimaryGeneratedColumn()
  id: number; // ID autoincremento ou gerado

  @Column()
  CodigoDocumento: number;

  @Column()
  CodigoPedido: number;

  @Column()
  NomeDocumento: string;

  @Column('text')
  Documento: string; // Base64 [cite: 40]

  @Column({ default: false })
  integrado: boolean;
}