import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProposalDto } from 'src/Common/Dtos/createProposal.dto';
import { UpdateProposalDto } from 'src/Common/Dtos/updateProposal.dto';
import { Proposal } from 'src/Common/Entities/proposal.entity';
import { statusProposal } from 'src/Common/type';
import { JobsService } from 'src/jobs/jobs.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class ProposalsService {
    constructor(
        @InjectRepository(Proposal) private repo: Repository<Proposal>,
        private userService: UsersService,
        private jobService: JobsService
    ) { }

    async create(data: CreateProposalDto, userId: number, jobId: number) {
        const user = await this.userService.findUser(userId)
        if (!user) throw new NotFoundException('User not found')
        if (user.role !== 'FREELANCER') throw new ForbiddenException('Only Freelancer can create a proposal')
        const job = await this.jobService.findById(jobId)
        if (!job) throw new NotFoundException('Job not found')
        if (job.status === 'CLOSED') throw new BadRequestException('This job is already closed')
        const proposal = this.repo.create({
            ...data, user, job
        })
        return await this.repo.save(proposal)
    }

    async getProposals(userId: number) {
        return this.repo.find({ where: { user: { id: userId } }, relations: ['job'] })
    }

    async findProposal(userId: number, id: number) {
        const proposal = await this.repo.findOne({ where: { id, user: { id: userId } }, relations: ['job'] })
        if (!proposal) throw new NotFoundException('Proposal not found')
        return proposal
    }

    async updateProposal(data: UpdateProposalDto, id: number, userId: number) {
        const proposal = await this.repo.findOne({
            where: { id, user: { id: userId } },
            relations: ['job']
        })
        if (!proposal) throw new NotFoundException('Proposal not found')
        if (proposal?.job.status === 'CLOSED') throw new BadRequestException('This job is already closed')
        const updated = await this.repo.update(
            { id, user: { id: userId } },
            { ...data, updatedAt: new Date() }
        )
        if (updated.affected === 0) throw new NotFoundException('The proposal not found')
        return await this.findProposal(id, userId)
    }

    async updateStatus(status: statusProposal, id: number, userId: number) {
        const proposal = await this.repo.findOne({
            where: { id, user: { id: userId } },
            relations: ['job']
        })
        if (!proposal) throw new NotFoundException('Proposal not found')
        proposal.status = status
        proposal.updatedAt = new Date()
        await this.repo.save(proposal)
        return { message: `The status is ${proposal.status} now`, proposal }
        // const result = await this.repo.update(
        //     { id, user: { id: userId } },
        //     { status, updatedAt: new Date() }
        // )
        // if (result.affected === 0) throw new NotFoundException('The proposal not found')
        // return { message: 'Your proposal has been updated' }
    }

    async delete(id: number, userId: number) {
        const proposal = await this.repo.findOne({ where: { id, user: { id: userId } } })
        if (!proposal) throw new NotFoundException('Proposal not found')
        await this.repo.remove(proposal)
        return { message: 'The proposal has been removed' }
    }
}
