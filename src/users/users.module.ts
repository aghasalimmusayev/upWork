import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Common/Entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { TokenEntity } from 'src/Common/Entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([TokenEntity])
  ],
  providers: [UsersService, JwtService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule { }
