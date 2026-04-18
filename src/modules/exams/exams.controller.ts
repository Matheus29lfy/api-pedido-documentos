  import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exames')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

@Post()
async arrive(@Body() createExamDto: CreateExamDto) {
  return await this.examsService.processArrival(createExamDto);
}
  @Get(':accessionNumber')
  async findOne(@Param('accessionNumber') accessionNumber: string) {
    return  await this.examsService.findOne(accessionNumber);
  }

  @Get('')
  async findAll()  {
    return await this.examsService.findAll();
  }
}