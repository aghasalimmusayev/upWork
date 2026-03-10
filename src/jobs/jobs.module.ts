import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from 'src/Common/Entities/job.entity';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity]), UsersModule],
  controllers: [JobsController],
  providers: [JobsService, JwtService]
})
export class JobsModule { }
