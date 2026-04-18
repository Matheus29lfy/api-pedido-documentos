import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateExamDto {
  @IsNumber()
  @IsNotEmpty({ message: 'O CodigoItemPedido é obrigatório para identificar o item.' })
  CodigoItemPedido: number;

  @IsString()
  @IsNotEmpty({ message: 'O AccessionNumber é a chave de integração e não pode estar vazio.' })
  AccessionNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'A Modalidade (ex: RX, CT) é necessária.' })
  Modalidade: string;

  @IsString()
  @IsNotEmpty({ message: 'O NomeProcedimento é obrigatório.' })
  NomeProcedimento: string;

  // Campo opcional para o caso de já sabermos o pedido no momento da criação isolada
  @IsOptional()
  @IsNumber()
  CodigoPedido?: number;
}