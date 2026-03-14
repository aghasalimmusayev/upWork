import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "./common.entity";
import { statusProposal } from "../type";
import { User } from "./user.entity";
import { JobEntity } from "./job.entity";

@Entity()
export class Proposal extends CommonEntity {
    @Column({ type: 'text' })
    coverLetter: string

    @Column()
    amount: number

    @Column({ type: 'text', default: statusProposal.PENDING })
    status: statusProposal

    @Column()
    estimatedDays: number

    @ManyToOne(() => User, (user) => user.proposals)
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => JobEntity, (job) => job.proposal)
    @JoinColumn({ name: 'jobId' })
    job: JobEntity
}


