import { Column, Entity, OneToMany } from "typeorm";
import { CommonEntity } from "./common.entity";
import { TokenEntity } from "./token.entity";

@Entity()
export class User extends CommonEntity {
    @Column()
    email: string

    @Column()
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
}