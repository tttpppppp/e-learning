import { Module } from '@nestjs/common';
import { VerifyTokenService } from './verify-token.service';
import { VerifyTokenController } from './verify-token.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VerifyTokenController],
  providers: [VerifyTokenService],
  exports: [VerifyTokenService],
})
export class VerifyTokenModule {}
