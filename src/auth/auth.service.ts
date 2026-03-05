import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/Common/Dtos/create-user.dto';
import { User } from 'src/Common/Entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import bcrypt from "bcrypt"
import { TokenEntity } from 'src/Common/Entities/token.entity';
import { generateAccessToken, generateRefreshToken } from 'src/Common/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        @InjectRepository(TokenEntity) private tokenRepo: Repository<TokenEntity>,
        private userService: UsersService
    ) { }

    async signup(data: CreateUserDto) {
        const exists = await this.repo.findOne({ where: { email: data.email } })
        if (exists) throw new BadRequestException('This email already exists')
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = this.repo.create({ ...data, password: hashedPassword })
        await this.repo.save(user)
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role
        })
        const refreshToken = generateRefreshToken(user)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const token = this.tokenRepo.create({
            tokenHash: refreshToken,
            expiresAt,
            user
        })
        await this.tokenRepo.save(token)
        return { user, accessToken, refreshToken }
    }

    async refresh(refreshToken: string) {
        const token = await this.tokenRepo.findOne({ where: { tokenHash: refreshToken } })
        if (!token) throw new UnauthorizedException('No Refresh Token')
        const accessToken = generateAccessToken({
            id: token.user.id,
            email: token.user.email,
            role: token.user.role
        })
        return { success: true, accessToken }
    }
}
