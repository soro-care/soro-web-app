import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  // Create Nest app with minimal logging in production
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // -------------------
  // Security middlewares
  // -------------------
  app.use(helmet());
  app.use(cookieParser());

  // -------------------
  // CORS configuration
  // -------------------
  const defaultOrigins = ['http://localhost:5173'];
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : defaultOrigins;

  app.enableCors({
    origin: envOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-anon-user-id', 'user-agent'],
  });

  // -------------------
  // Global Prefix & Validation
  // -------------------
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // -------------------
  // Swagger API Documentation
  // -------------------
  const swaggerBuilder = new DocumentBuilder()
    .setTitle('SORO Mental Health Platform API')
    .setDescription(
      'Complete API documentation for SORO - mental health support platform with booking, PSN training, anonymous stories, and more.',
    )
    .setVersion('1.0')
    .setContact('SORO Support', 'https://soro.care', 'support@soro.care')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .addTag('Authentication', 'User registration, login, password reset')
    .addTag('Users', 'User profile management and operations')
    .addTag('Bookings', 'Counseling session booking management')
    .addTag('Availability', 'Professional availability scheduling')
    .addTag('Notifications', 'Real-time and push notifications')
    .addTag('Blog', 'Blog posts, categories, and comments')
    .addTag('Echo', 'Anonymous story sharing with crisis detection')
    .addTag('Survey', 'Mental health assessment surveys')
    .addTag('PSN', 'Peer Support Network training portal')
    .addTag('Admin', 'Administrative operations and analytics');

  // Environment-specific Swagger servers
  if (process.env.NODE_ENV === 'production') {
    swaggerBuilder.addServer('https://soro-care.fly.dev', 'Production');
  } else if (process.env.NODE_ENV === 'staging') {
    swaggerBuilder.addServer('https://soro-care-staging.fly.dev', 'Staging');
  } else {
    swaggerBuilder.addServer('http://localhost:5001', 'Local Development');
  }

  const swaggerConfig = swaggerBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SORO API Documentation',
    customfavIcon: 'https://soro.care/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // -------------------
  // Health Check Endpoint
  // -------------------
  app.getHttpAdapter().get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // -------------------
  // Start server
  // -------------------
  const port = process.env.PORT || 5001;
  await app.listen(port, '0.0.0.0');

  console.log(`
  ✅ SORO Backend is running!
  🚀 Server: http://localhost:${port}/api
  📚 API Docs: http://localhost:${port}/api/docs
  🏥 Health: http://localhost:${port}/api/health
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
}

void bootstrap();
