  import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('exames')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}
  
  @Get(':accessionNumber')
  async findOne(@Param('accessionNumber') accessionNumber: string) {
    return  await this.examsService.findOne(accessionNumber);
  }

  @Get('')
  async findAll()  {
    return await this.examsService.findAll();
  }
}