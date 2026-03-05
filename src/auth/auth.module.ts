import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Common/Entities/user.entity';
import { TokenEntity } from 'src/Common/Entities/token.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TokenEntity]),
    UsersModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
