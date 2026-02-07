import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './global-exception.filter';
import { LoggerService } from './logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get LoggerService instance
  const loggerService = app.get(LoggerService);

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(loggerService));

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable cookie parser
  app.use(cookieParser());

  // Enable CORS with credentials
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
