import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from 'src/Common/Dtos/update-user.dto';
import { User } from 'src/Common/Entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt'
import { TokenEntity } from 'src/Common/Entities/token.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        @InjectRepository(TokenEntity) private tokenRepo: Repository<TokenEntity>
    ) { }

    async getUsers() {
        return await this.repo.find()
    }

    async findUser(id: number) {
        const user = await this.repo.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')
        return user
    }

    async findUserByEmail(email: string) {
        return await this.repo.findOne({ where: { email } })
    }

    async update(id: number, data: UpdateUserDto, currentUserId: number) {
        if (id !== currentUserId) throw new ForbiddenException('You can only update your own profile')
        const user = await this.findUser(id)
        if (!user) throw new NotFoundException('User not found')
        const result = await this.repo.update(user.id, { ...data, updatedAt: new Date() })
        if (result.affected === 0) throw new NotFoundException('User not found')
        return await this.findUser(user.id)
    }

    async updatePassword(id: number, oldPassword: string, password: string, currentUserId: number) {
        if (id !== currentUserId) throw new ForbiddenException('You can only change your own password')
        const user = await this.findUser(id)
        if (!user) throw new NotFoundException('User not found')
        const checkOldPassword = await bcrypt.compare(oldPassword, user.password)
        if (!checkOldPassword) throw new ForbiddenException('Your current password is wrong')
        const checkNewPassword = await bcrypt.compare(password, user.password)
        if (checkNewPassword) throw new ForbiddenException('You can not use the same password')
        await this.tokenRepo.update(
            { user: { id: user.id }, revoke: false },
            { revoke: true }
        )
        const hashed = await bcrypt.hash(password, 10)
        const result = await this.repo.update(user.id, { password: hashed })
        if (result.affected === 0) throw new NotFoundException('User not found')
        return { message: 'Your password has been updated' }
    }

    async remove(id: number, currentUserId: number) {
        if (id !== currentUserId) throw new ForbiddenException('You can only delete your own profile')
        const user = await this.repo.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')
        await this.repo.remove(user)
        return { message: 'User has been removed' }
    }
}
