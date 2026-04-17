import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Documents Controller (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/documentos (POST) - Deve retornar 400 se faltar campos obrigatórios', async () => {
    return request(app.getHttpServer())
      .post('/documentos')
      .send({ CodigoDocumento: 1 }) // Faltando CodigoPedido e outros
      .expect(400);
  });

  it('/documentos (POST) - Deve criar documento com sucesso', async () => {
    // Primeiro garantimos que o pedido existe para não dar 404
    await request(app.getHttpServer())
      .post('/pedidos')
      .send({
        CodigoPedido: 200,
        NomePaciente: 'Teste E2E',
        Exames: [{ AccessionNumber: 'E2E-1', CodigoItemPedido: 1, Modalidade: 'RX', NomeProcedimento: 'X' }]
      });

    const res = await request(app.getHttpServer())
      .post('/documentos')
      .send({
        CodigoDocumento: 1,
        CodigoPedido: 200,
        NomeDocumento: 'Laudo Teste',
        Documento: 'base64-content'
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  afterAll(async () => {
    await app.close();
  });
});