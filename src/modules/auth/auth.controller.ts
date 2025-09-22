/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseData } from 'src/core/response/responseData';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalGuard } from './guard/local.guard';
import { JwtAuthGuard } from './guard/jwt.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { VerifyTokenService } from '../verify-token/verify-token.service';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verifyTokenService: VerifyTokenService,
    private eventEmitter: EventEmitter2,
  ) {}
  @Post('create')
  async create(@Body() createDto: CreateUserDto) {
    const { token, id } = await this.authService.create(createDto);
    const idVerifyToken = randomUUID();
    await this.verifyTokenService.saveVerifyToken(idVerifyToken, id);
    this.eventEmitter.emit('user.created', {
      userId: id,
      verifyLink: `http://localhost:8080/auth/verify/${idVerifyToken}`,
    });
    return new ResponseData(
      token,
      'Create successful please access your email to verify account',
      200,
    );
  }
  @Post('login')
  @UseGuards(LocalGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(@Body() loginDto: LoginDto, @Request() req: any) {
    try {
      const token = this.authService.generateToken({
        email: req.user.email,
        sub: req.user._id,
        role: req.user.role,
      });
      return new ResponseData(token, 'Login successful', 200);
    } catch (error: any) {
      console.log(error);
      return new ResponseData('', 'Login failed', 500);
    }
  }
  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Request() req: any) {
    console.log('Inside AuthController status method');
    console.log(req.user);
    return req.user;
  }
  @Get('verify/:token')
  async verifyEmail(@Request() req: any) {
    const { token } = req.params;
    const result = await this.verifyTokenService.verifyTokenAccount(token);
    if (result) {
      return new ResponseData('', 'Verify email successful', 200);
    } else {
      return new ResponseData('', 'Verify email failed', 400);
    }
  }
}
