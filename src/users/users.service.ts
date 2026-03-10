import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from 'src/Common/Dtos/update-user.dto';
import { User } from 'src/Common/Entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    async getUsers() {
        return await this.repo.find()
    }

    async findUser(id: number) {
        const user = this.repo.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')
        return user
    }

    async findUserByEmail(email: string) {
        return await this.repo.findOne({ where: { email } })
    }

    async update(id: number, data: UpdateUserDto) {
        const user = await this.findUser(id)
        if (!user) throw new NotFoundException('User not found')
        const result = await this.repo.update(user.id, { ...data, updatedAt: new Date() })
        if (result.affected === 0) throw new NotFoundException('User not found')
        return await this.findUser(user.id)
    }

    async updatePassword(id: number, password: string) {
        const user = await this.findUser(id)
        if (!user) throw new NotFoundException('User not found')
        const checkPassword = await bcrypt.compare(password, user.password)
        if (checkPassword) throw new ForbiddenException('You can not write the same password')
        const hashed = await bcrypt.hash(password, 10)
        const result = await this.repo.update(user.id, { password: hashed })
        if (result.affected === 0) throw new NotFoundException('User not found')
        return { message: 'Your password has been updated' }
    }

    async remove(id: number) {
        const user = await this.repo.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')
        await this.repo.remove(user)
        return { message: 'User has been removed' }
    }
}
