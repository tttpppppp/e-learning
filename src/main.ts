/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { GlobalException } from './core/exception/GlobalException';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Server } from 'http';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
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

  // ✅ Trả về http server (callable)
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: Request, res: Response) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return (cachedServer as any)(req, res); // ✅ server là function nên gọi OK
}
