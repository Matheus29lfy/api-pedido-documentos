import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Ativa a validação global (importante para os Pedidos/Exames)
  app.useGlobalPipes(new ValidationPipe());

  // Escuta em 0.0.0.0 para funcionar corretamente dentro do container
  await app.listen(3000, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();