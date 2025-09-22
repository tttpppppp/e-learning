import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class UserCreatedListener {
  constructor(
    private mailerService: MailerService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  @OnEvent('user.created')
  async handleUserCreatedEvent(payload: {
    userId: string;
    verifyLink: string;
  }) {
    const user = await this.userModel.findById(payload.userId).exec();
    if (!user) return;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your account',
      text: `Hello ${user.username} Please click here to verify: ${payload.verifyLink}`,
    });
    console.log('User created event received:', payload);
  }
}
