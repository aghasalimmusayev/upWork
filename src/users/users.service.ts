import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Common/Entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    async getUsers() {
        const users = await this.repo.find()
        if (users.length === 0) throw new NotFoundException('No User exists')
        return users
    }

    async findUser(id: number) {
        const user = this.repo.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')
        return user
    }

    async findUserByEmail(email: string) {
        return await this.repo.findOne({ where: { email } })
    }

    async remove(id: number) {
        const user = await this.repo.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')
        await this.repo.remove(user)
        return { message: 'User has been removed' }
    }
}
