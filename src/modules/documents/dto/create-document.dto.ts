import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsNumber()
  @IsNotEmpty({ message: 'O CodigoDocumento é obrigatório.' })
  CodigoDocumento: number;

  @IsNumber()
  @IsNotEmpty({ message: 'O CodigoPedido é obrigatório.' })
  CodigoPedido: number;

  @IsString()
  @IsNotEmpty({ message: 'O NomeDocumento é obrigatório.' })
  NomeDocumento: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo Documento (Base64) é obrigatório.' })
  Documento: string;
}