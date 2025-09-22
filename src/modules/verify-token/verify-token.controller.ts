import { Controller } from '@nestjs/common';
import { VerifyTokenService } from './verify-token.service';

@Controller('verify-token')
export class VerifyTokenController {
  constructor(private readonly verifyTokenService: VerifyTokenService) {}
}
