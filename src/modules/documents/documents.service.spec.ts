import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { OrdersService } from '../orders/orders.service';
import { ConflictException } from '@nestjs/common';

describe('DocumentsService (Unit)', () => {
  let service: DocumentsService;
  let docRepo: any;
  let ordersService: any;

  const mockDocRepo = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(doc => Promise.resolve({ id: 1, ...doc })),
  };

  const mockOrdersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: mockDocRepo },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    docRepo = module.get(getRepositoryToken(Document));
    ordersService = module.get(OrdersService);
  });

  it('deve lançar ConflictException se o documento for duplicado (Regra 6)', async () => {
    docRepo.findOne.mockResolvedValue({ id: 1 }); // Simula que já existe

    await expect(
      service.createDocument({ CodigoDocumento: 1, CodigoPedido: 100 })
    ).rejects.toThrow(ConflictException);
  });

  it('deve marcar documento como integrado se o pedido já estiver integrado (Regra 3)', async () => {
    docRepo.findOne.mockResolvedValue(null);
    ordersService.findOne.mockResolvedValue({ CodigoPedido: 100, integrado: true });

    const result = await service.createDocument({
      CodigoDocumento: 1,
      CodigoPedido: 100,
      NomeDocumento: 'Teste',
      Documento: 'base64'
    });

    expect(result.data.integrado).toBe(true);
    expect(result.message).toContain('vinculado aos exames');
  });

  it('deve marcar documento como NÃO integrado se o pedido não estiver integrado', async () => {
    docRepo.findOne.mockResolvedValue(null);
    ordersService.findOne.mockResolvedValue({ CodigoPedido: 101, integrado: false });

    const result = await service.createDocument({
      CodigoDocumento: 2,
      CodigoPedido: 101,
      NomeDocumento: 'Teste 2',
      Documento: 'base64'
    });

    expect(result.data.integrado).toBe(false);
    expect(result.message).toContain('Aguardando chegada do exame');
  });
});