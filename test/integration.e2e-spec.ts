import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Fluxo de Integração (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('Cenários de Pedidos e Documentos', () => {
    const accession = `ACC-${Date.now()}`;
    const pedidoId = 100;

    it('Passo 1: Deve criar pedido não integrado', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos')
        .send({
          CodigoPedido: pedidoId,
          NomePaciente: 'João Silva',
          Exames: [{ AccessionNumber: accession, CodigoItemPedido: 1, Modalidade: 'RX', NomeProcedimento: 'Torax' }]
        });
      
      expect(res.status).toBe(201);
      expect(res.body.data.integrado).toBe(false);
    });

    it('Passo 2: Deve salvar documento como NÃO integrado (Regra 3)', async () => {
      const res = await request(app.getHttpServer())
        .post('/documentos')
        .send({
          CodigoDocumento: 50,
          CodigoPedido: pedidoId,
          NomeDocumento: 'Laudo 1',
          Documento: 'base64-string'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.integrado).toBe(false);
    });

    it('Passo 3: Deve retornar 409 ao duplicar documento (Regra 6)', async () => {
      await request(app.getHttpServer())
        .post('/documentos')
        .send({
          CodigoDocumento: 50,
          CodigoPedido: pedidoId,
          NomeDocumento: 'Laudo Duplicado',
          Documento: 'base64-string'
        })
        .expect(409);
    });

    it('Passo 4: Deve integrar pedido via chegada de exame (Regra 4)', async () => {
      // Endpoint de chegadas que você criou
      await request(app.getHttpServer())
        .post('/exames') 
        .send({ AccessionNumber: accession })
        .expect(201);

      // Verifica se o pedido mudou para integrado: true
      const check = await request(app.getHttpServer()).get(`/pedidos/${pedidoId}`);
      expect(check.body.integrado).toBe(true);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});