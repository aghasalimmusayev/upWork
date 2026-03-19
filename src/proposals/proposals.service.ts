import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProposalDto } from 'src/Common/Dtos/createProposal.dto';
import { UpdateProposalDto } from 'src/Common/Dtos/updateProposal.dto';
import { Proposal } from 'src/Common/Entities/proposal.entity';
import { statusProposal } from 'src/Common/type';
import { JobsService } from 'src/jobs/jobs.service';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class ProposalsService {
    constructor(
        @InjectRepository(Proposal) private repo: Repository<Proposal>,
        private userService: UsersService,
        private jobService: JobsService,
        private mailService: MailService
    ) { }

    async create(data: CreateProposalDto, userId: number, jobId: number) {
        const user = await this.userService.findUser(userId)
        if (!user) throw new NotFoundException('User not found')
        if (user.role !== 'FREELANCER') throw new ForbiddenException('Only Freelancer can create a proposal')
        const job = await this.jobService.findByUser(jobId)
        if (!job) throw new NotFoundException('Job not found')
        if (job.status === 'CLOSED') throw new BadRequestException('This job is already closed')
        const jobOwner = await this.userService.findUser(job.user.id)
        if (!jobOwner) throw new NotFoundException('JobOwner not found')
        const proposal = this.repo.create({
            ...data, user, job
        })
        await this.repo.save(proposal)
        await this.mailService.sendNotifyProposal(
            jobOwner?.email,
            jobOwner?.name,
            user.name,
            job.title
        )
        return proposal
    }

    async getProposals() {
        // if (role === 'FREELANCER') return this.repo.find({ where: { user: { id: userId } }, relations: ['job'] })
        // else return this.repo.find({ where: { job: { user: { id: userId } } }, relations: ['job', 'user'] })
        return this.repo.find()
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
            where: { id },
            relations: ['job', 'job.user', 'user']
        })
        if (!proposal) throw new NotFoundException('Proposal not found')
        if (proposal.status !== statusProposal.PENDING) {
            throw new BadRequestException(`You cannot update status, proposal is already ${proposal.status}`)
        }

        const isJobOwner = proposal.job.user.id === userId
        const isFreelancer = proposal.user.id === userId
        if (isJobOwner) {
            if (status === statusProposal.WITHDRAWN) throw new ForbiddenException('Job owner cannot withdraw a proposal')
        }
        else if (isFreelancer) {
            if (status !== statusProposal.WITHDRAWN) throw new ForbiddenException('Freelancer can only withdraw a proposal')
        }
        else throw new ForbiddenException('You have no permission to update this proposal')

        proposal.status = status
        proposal.updatedAt = new Date()
        await this.repo.save(proposal)
        await this.mailService.sendNotifyProposalStatus(
            isJobOwner ? proposal.user.email : proposal.job.user.email,
            isJobOwner ? proposal.user.name : proposal.job.user.name,
            status,
            proposal.job.title
        )
        return { message: `The status is ${proposal.status} now`, proposal }
    }

    async delete(id: number, userId: number) {
        const proposal = await this.repo.findOne({ where: { id, user: { id: userId } } })
        if (!proposal) throw new NotFoundException('Proposal not found')
        await this.repo.remove(proposal)
        return { message: 'The proposal has been removed' }
    }
}
