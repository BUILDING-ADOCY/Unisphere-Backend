import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load environment variables from .env
  dotenv.config();

  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin access
  app.enableCors();

  // Global validation pipe with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API documentation configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Unisphere API')
    .setDescription('API documentation for Unisphere Backend')
    .setVersion('1.0')
    .addBearerAuth() // Enables JWT support in Swagger UI
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  // Start server on configured port or fallback to 8888
  const port = process.env.PORT || 8888;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger UI available at http://localhost:${port}/api`);
}
bootstrap();
