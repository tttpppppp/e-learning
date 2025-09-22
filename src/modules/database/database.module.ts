import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity';
import {
  VerificationToken,
  VerificationTokenSchema,
} from '../verify-token/entities/verify.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationToken.name, schema: VerificationTokenSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
