import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AuthModule } from './modules/auth/auth.module';
import { LecturesModule } from './modules/lectures/lectures.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { VerifyTokenModule } from './modules/verify-token/verify-token.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL || ''),
    UsersModule,
    CoursesModule,
    AuthModule,
    LecturesModule,
    EnrollmentsModule,
    VerifyTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
