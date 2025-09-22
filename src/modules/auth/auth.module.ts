import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guard/jwt.guard';
import { VerifyTokenService } from '../verify-token/verify-token.service';
import { UserCreatedListener } from 'src/events/user-created.event';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [PassportModule, DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    VerifyTokenService,
    UserCreatedListener,
  ],
})
export class AuthModule {}
