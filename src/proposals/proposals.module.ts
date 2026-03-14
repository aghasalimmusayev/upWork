import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from 'src/Common/Entities/proposal.entity';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal]),
    UsersModule,
    JobsModule
  ],
  providers: [ProposalsService, JwtService],
  controllers: [ProposalsController]
})
export class ProposalsModule { }
