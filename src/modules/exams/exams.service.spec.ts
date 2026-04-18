import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { OrdersService } from '../orders/orders.service';
import { DocumentsService } from '../documents/documents.service';

describe('ExamsService (Unit)', () => {
  let service: ExamsService;
  let repo: any;

  const mockExamRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  // Mocks para as dependências que o Nest reclamou
  const mockOrdersService = {
    updateIntegrationStatus: jest.fn().mockResolvedValue(undefined),
  };

  const mockDocumentsService = {
    linkPendingDocuments: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        {
          provide: getRepositoryToken(Exam),
          useValue: mockExamRepo,
        },
        // Adicione estas duas linhas:
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: DocumentsService, useValue: mockDocumentsService },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
    repo = module.get(getRepositoryToken(Exam));
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve validar se múltiplos AccessionNumbers existem (existsMany)', async () => {
    // Simula que o banco encontrou um dos exames da lista
    repo.count.mockResolvedValue(1);

    const input = [ 'AAA', 'BBB' ];
    const result = await service.existsMany(input);

    expect(result).toBe(true);
  });
  
  it('deve retornar false se o count for 0 no existsMany', async () => {
    repo.count.mockResolvedValue(0);

    const result = await service.existsMany(['CCC']);

    expect(result).toBe(false);
  });
});