import { Column, Entity, OneToMany } from "typeorm";
import { CommonEntity } from "./common.entity";
import { TokenEntity } from "./token.entity";
import { JobEntity } from "./job.entity";
import { Proposal } from "./proposal.entity";
import { Exclude } from "class-transformer";

@Entity()
export class User extends CommonEntity {
    @Column()
    email: string

    @Column()
    @Exclude()
    password: string

    @Column({ type: 'text' })
    role: 'CLIENT' | 'FREELANCER'

    @Column({ type: 'varchar', nullable: true })
    name: string

    @Column({ type: 'varchar', nullable: true })
    surname: string

    @Column({ type: 'varchar', nullable: true })
    phone: string

    @OneToMany(() => TokenEntity, (tokens) => tokens.user)
    tokens: TokenEntity[]

    @OneToMany(() => JobEntity, (jobs) => jobs.user)
    jobs: JobEntity[]

    @OneToMany(() => Proposal, (prposals) => prposals.user)
    proposals: Proposal[]
}