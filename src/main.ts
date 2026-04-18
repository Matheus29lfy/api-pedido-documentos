import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // O Logger estruturado do Nest ajuda no monitoramento do container
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    // Aqui você ativa os logs estruturados para erro, aviso e log comum
    logger: ['error', 'warn', 'log'], 
  });

  // Configuração refinada de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos que não estão no DTO
      forbidNonWhitelisted: true, // Retorna erro se enviarem campos desconhecidos
      transform: true, // Transforma tipos automaticamente (ex: string para number)
    }),
  );

  // Prefixo para facilitar versionamento futuro (Ex: http://localhost:3000/api/pedidos)
  // Opcional: app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 API de Integração rodando em: http://localhost:${port}`);
}

bootstrap();