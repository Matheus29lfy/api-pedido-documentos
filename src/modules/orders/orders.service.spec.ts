import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Exam } from '../exams/entities/exam.entity';
import { ExamsService } from '../exams/exams.service';
import { DocumentsService } from '../documents/documents.service'; // Importe aqui

describe('OrdersService (Unit)', () => {
  let service: OrdersService;
  let repo: any;

  const mockOrderRepo = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(order => Promise.resolve({ ...order, id: 1 })),
  };

  // Mock para o repositório de exames
  const mockExamRepo = {
    create: jest.fn().mockImplementation(dto => dto),
  };

  const mockExamsService = {
    existsMany: jest.fn().mockResolvedValue(false),
  };

  // Mock para o DocumentsService
  const mockDocsService = {
    linkPendingDocuments: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(Exam), useValue: mockExamRepo }, // Use o mock aqui
        { provide: ExamsService, useValue: mockExamsService },
        { provide: DocumentsService, useValue: mockDocsService }, // Injeção necessária
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repo = module.get(getRepositoryToken(Order));
  });

  it('deve criar um novo pedido com integrado: false se o exame não existir no sistema', async () => {
    const dto = { CodigoPedido: 10, Exames: [{ AccessionNumber: 'X' }] };
    repo.findOne.mockResolvedValue(null); 

    const result = await service.createOrUpdate(dto);

    expect(result.isNew).toBe(true);
    expect(result.data.integrado).toBe(false);
    // Verifica se o método de criar exames foi chamado
    expect(mockExamRepo.create).toHaveBeenCalled();
  });
});