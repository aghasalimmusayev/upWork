import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { CommonEntity } from "./common.entity";

@Entity()
export class TokenEntity extends CommonEntity {
    @Column()
    tokenHash: string

    @Column()
    expiresAt: Date

    @Column({ default: false })
    revoke: boolean

    @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User
}