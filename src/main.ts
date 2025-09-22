/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { GlobalException } from './core/exception/GlobalException';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Server } from 'http';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  // ✅ Pipes
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

  // ✅ Global Exception
  app.useGlobalFilters(new GlobalException());

  // ✅ Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Learning API')
    .setDescription('API for E-Learning')
    .setVersion('1.0')
    .addTag('E-Learning')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // ❗ Không dùng listen (serverless function không lắng cổng)
  await app.init();
  return app.getHttpAdapter().getInstance();
}

// ✅ Export default handler cho Vercel
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(req, res);
}
