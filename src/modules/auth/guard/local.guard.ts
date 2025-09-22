/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<any> {
    console.log('Hello, World');
    const request = context.switchToHttp().getRequest();

    const dto = plainToInstance(LoginDto, request.body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return super.canActivate(context);
  }
}
