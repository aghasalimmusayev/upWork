import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateJobDto } from 'src/Common/Dtos/create-job.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { AuthRequest } from 'src/Common/type';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('jobs')
export class JobsController {
    constructor(private jobService: JobsService) { }

    @Post()
    createJob(@Body() body: CreateJobDto, @Req() req: AuthRequest) {
        return this.jobService.create(body, req.user!.id)
    }
}
