import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateJobDto } from 'src/Common/Dtos/create-job.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { User } from 'src/Common/Entities/user.entity';
import { UpdateJobDto } from 'src/Common/Dtos/updateJob.dto';
import { UpdateStatusJob } from 'src/Common/Dtos/update-statusJob.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('jobs')
export class JobsController {
    constructor(private jobService: JobsService) { }

    @Post()
    @UseInterceptors(ClassSerializerInterceptor)
    createJob(@Body() body: CreateJobDto, @CurrentUser() user: User) {
        return this.jobService.create(body, user.id)
    }

    @Get()
    getAllJobs() {
        return this.jobService.getAll()
    }

    @Get('/:id')
    findJob(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        return this.jobService.findJob(id, user.id)
    }

    @Patch('/:id')
    updateJob(@Body() body: UpdateJobDto, @CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
        return this.jobService.updateJob(id, user.id, user.role, body)
    }

    @Patch('/status/:id')
    updateStatus(@Body() body: UpdateStatusJob, @Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        return this.jobService.closeJob(id, user.id, user.role, body.status)
    }

    @Delete('/:id')
    deleteJob(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        return this.jobService.delete(id, user.id, user.role,)
    }
}
