import { Test, TestingModule } from '@nestjs/testing';
import { VerifyTokenController } from './verify-token.controller';
import { VerifyTokenService } from './verify-token.service';

describe('VerifyTokenController', () => {
  let controller: VerifyTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifyTokenController],
      providers: [VerifyTokenService],
    }).compile();

    controller = module.get<VerifyTokenController>(VerifyTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
