import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { CommonEntity } from "./common.entity"
import { User } from "./user.entity"
import { Proposal } from "./proposal.entity"
import { statusJob } from "../type"

@Entity()
export class JobEntity extends CommonEntity {
    @Column()
    title: string

    @Column()
    description: string

    @Column({ type: 'text' })
    paymentType: 'FIXED' | 'HOURLY'

    @Column()
    price: number

    @Column()
    category: string

    @Column('simple-array')
    skills: string[]

    @Column({ type: 'text', default: statusJob.OPEN })
    status: statusJob

    @ManyToOne(() => User, (user) => user.jobs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User

    @OneToMany(() => Proposal, (proposal) => proposal.job)
    proposal: Proposal[]
}


