import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { GlobalException } from '../../src/core/exception/GlobalException';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

let cachedServer: any;

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
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
    .setDescription('API for E-Learning')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.init();
  return server; // ✅ Express instance
}

export default async function handler(req: Request, res: Response) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer(req, res); // ✅ Express app callable
}
