import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateJobDto } from 'src/Common/Dtos/create-job.dto';
import { UpdateJobDto } from 'src/Common/Dtos/updateJob.dto';
import { JobEntity } from 'src/Common/Entities/job.entity';
import { statusJob } from 'src/Common/type';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(JobEntity) private repo: Repository<JobEntity>,
        private userService: UsersService
    ) { }

    async create(data: CreateJobDto, userId: number) {
        const user = await this.userService.findUser(userId)
        if (!user) throw new NotFoundException('User not found')
        if (user.role !== 'CLIENT') throw new ForbiddenException('Only CLIENT can cerate a job')
        const newJob = this.repo.create({ ...data, user })
        return this.repo.save(newJob)
    }

    async getAll(userId: number) {
        return await this.repo.find({ where: { user: { id: userId } } })
    }

    async findJob(id: number, userId: number) {
        const job = await this.repo.findOne({ where: { id, user: { id: userId } } })
        if (!job) throw new NotFoundException('Job not found')
        return job
    }

    async findById(id: number) {
        const job = await this.repo.findOne({ where: { id } })
        if (!job) throw new NotFoundException('Job not found')
        return job
    }

    async updateJob(id: number, userId: number, data: UpdateJobDto) {
        const job = await this.findJob(id, userId)
        if (!job) throw new NotFoundException('Job not found')
        const result = await this.repo.update(job.id, { ...data, updatedAt: new Date() })
        if (result.affected === 0) throw new NotFoundException('Something went wrong in updating job')
        return await this.findJob(id, userId)
    }

    async closeJob(id: number, userId: number, status: statusJob) {
        const job = await this.findJob(id, userId)
        if (!job) throw new NotFoundException('Job not found')
        job.status = status
        job.updatedAt = new Date()
        await this.repo.save(job)
        return { message: 'The job CLOSED', job }
    }

    async delete(id: number, userId: number) {
        const job = await this.repo.findOne({ where: { id, user: { id: userId } } })
        if (!job) throw new NotFoundException('Job not found')
        await this.repo.remove(job)
        return { message: 'The Job has been removed' }
    }
}
