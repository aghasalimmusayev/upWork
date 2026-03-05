import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class TokenEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenHash: string

    @CreateDateColumn()
    createdAt: Date

    @Column()
    expiresAt: Date

    @Column({ default: false })
    revoke: boolean

    @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User
}