import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  console.log(`FiscalPro API running on http://localhost:${port}`);
}
bootstrap();
