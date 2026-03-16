import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Common/Entities/user.entity';
import { TokenEntity } from 'src/Common/Entities/token.entity';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TokenEntity]),
    UsersModule, MailModule
  ],
  providers: [AuthService, JwtService],
  controllers: [AuthController]
})
export class AuthModule { }
