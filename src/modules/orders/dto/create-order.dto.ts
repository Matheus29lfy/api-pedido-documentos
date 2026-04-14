import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExamItemDto {
  @IsNumber()
  CodigoltemPedido: number;

  @IsString()
  AccessionNumber: string;

  @IsString()
  Modalidade: string;

  @IsString()
  NomeProcedimento: string;
}

export class CreateOrderDto {
  @IsNumber()
  CodigoPedido: number;

  @IsString()
  NomePaciente: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamItemDto)
  Exames: ExamItemDto[]
}