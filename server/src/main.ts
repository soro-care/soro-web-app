// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5001;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://soro.care',
      'https://www.soro.care',
      configService.get<string>('FRONTEND_URL'),
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-anon-user-id',
      'Accept',
    ],
  });

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation (only in development)
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Soro Care API')
      .setDescription('Mental Health Platform API Documentation')
      .setVersion('2.0')
      .addBearerAuth()
      .addCookieAuth('accessToken')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    logger.log('📚 Swagger documentation available at /api/docs');
  }

  // Start server
  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}/api`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`✅ Health check: http://localhost:${port}/api/health`);
}

void bootstrap();
