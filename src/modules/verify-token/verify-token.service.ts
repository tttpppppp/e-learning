import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { VerificationToken } from './entities/verify.entity';
import { Model } from 'mongoose';
import { ObjectId } from 'typeorm/browser';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VerifyTokenService {
  constructor(
    @InjectModel(VerificationToken.name)
    private verifyToken: Model<VerificationToken>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async saveVerifyToken(token: string, userId: ObjectId): Promise<boolean> {
    const newVerifyToken = new this.verifyToken({ token, userId });
    await newVerifyToken.save();
    return newVerifyToken ? true : false;
  }
  async verifyTokenAccount(token: string): Promise<boolean> {
    const verifyToken = await this.verifyToken.findOne({ token });
    if (!verifyToken) {
      return false;
    }
    await this.userModel.updateOne(
      { _id: verifyToken.userId },
      { status: 'active' },
    );
    return true;
  }
}
