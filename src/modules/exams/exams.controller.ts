  import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('exames')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  async receiveArrival(@Body() arrivalDto: { AccessionNumber: string }) {
    return this.examsService.handleArrival(arrivalDto);
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