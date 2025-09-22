/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { UserAlreadyExistsException } from './UserAlreadyExistsException';

@Catch(UserAlreadyExistsException, BadRequestException)
export class GlobalException implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    if (exception instanceof UserAlreadyExistsException) {
      response.status(status).json({
        success: false,
        statusCode: status,
        message: exception.getResponse(),
      });
    } else if (exception instanceof BadRequestException) {
      const res: any = exception.getResponse();
      const result = {};
      if (res?.message && Array.isArray(res.message)) {
        res.message.forEach((err) => {
          result[err.property] = Object.values(err.constraints);
        });
        response.status(status).json({
          success: false,
          statusCode: status,
          message: 'Validation failed',
          errors: result || null,
        });
      }
    }
  }
}
