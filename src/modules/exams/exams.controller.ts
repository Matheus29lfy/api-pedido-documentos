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
  async checkStatus(@Param('accessionNumber') accessionNumber: string) {
    const arrived = await this.examsService.exists(accessionNumber);
    return { AccessionNumber: accessionNumber, arrived };
  }
}