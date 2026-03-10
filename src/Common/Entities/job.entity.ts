import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { CommonEntity } from "./common.entity"
import { User } from "./user.entity"

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

    @Column({ type: 'text', default: 'OPEN' })
    status: 'OPEN' | 'CLOSED'

    @ManyToOne(() => User, (user) => user.jobs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User
}


