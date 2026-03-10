import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateJobDto } from 'src/Common/Dtos/create-job.dto';
import { JobEntity } from 'src/Common/Entities/job.entity';
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

    async updateJob(id: number, data: any) {

    }

    async delete(id: number, userId: number) {
        const job = await this.repo.findOne({ where: { id, user: { id: userId } } })
        if (!job) throw new NotFoundException('Job not found')
        await this.repo.remove(job)
        return { message: 'The Job has been removed' }
    }
}
