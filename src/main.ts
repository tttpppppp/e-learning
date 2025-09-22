/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { GlobalException } from './core/exception/GlobalException';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';

let cachedApp: any;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors) => {
        const result = {};
        errors.forEach((err) => {
          if (err.constraints) {
            result[err.property] = Object.values(err.constraints);
          }
        });
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation Error',
          errors: result,
        });
      },
    }),
  );

  app.useGlobalFilters(new GlobalException());

  const config = new DocumentBuilder()
    .setTitle('E-Learning API')
    .setDescription('Api for E-Learning')
    .setVersion('1.0')
    .addTag('E-Learning')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.init();
  return app.getHttpAdapter().getInstance(); // ✅ Trả về Express app
}

export default async function handler(req: Request, res: Response) {
  if (!cachedApp) {
    cachedApp = await bootstrapServer();
  }
  return cachedApp(req, res); // ✅ Express app là callable
}
