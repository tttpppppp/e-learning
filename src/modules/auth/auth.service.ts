import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ObjectId } from 'mongodb';
import { UserAlreadyExistsException } from 'src/core/exception/UserAlreadyExistsException';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ token: string; id: ObjectId }> {
    const findUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (findUser != null) {
      throw new UserAlreadyExistsException(createUserDto.email);
    }
    const salt = await bcrypt.genSalt();
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();
    const token = this.generateToken({
      email: createdUser.email,
      sub: createdUser._id,
      role: createdUser.role,
    });
    return { token, id: createdUser._id };
  }
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  generateToken = (payload: { email: string; sub: ObjectId; role: string }) => {
    return this.jwtService.sign(payload);
  };
}
