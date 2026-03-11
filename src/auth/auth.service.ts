import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/Common/Dtos/create-user.dto';
import { User } from 'src/Common/Entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import bcrypt from "bcrypt"
import { TokenEntity } from 'src/Common/Entities/token.entity';
import { generateAccessToken, generateRefreshToken } from 'src/Common/jwt';
import { LoginDto } from 'src/Common/Dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        @InjectRepository(TokenEntity) private tokenRepo: Repository<TokenEntity>,
        private userService: UsersService,
        private jwt: JwtService
    ) { }

    async signup(data: CreateUserDto) {
        const exists = await this.repo.findOne({ where: { email: data.email } })
        if (exists) throw new BadRequestException('This email already exists')
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = this.repo.create({ ...data, password: hashedPassword })
        await this.repo.save(user)
        const accessToken = await generateAccessToken(this.jwt, {
            id: user.id,
            email: user.email,
            role: user.role
        })
        const refreshToken = await generateRefreshToken(this.jwt, user)
        const expiresAt = new Date(Date.now() + Number(process.env.JWT_REFRESH_TIME))
        const token = this.tokenRepo.create({
            tokenHash: refreshToken,
            expiresAt,
            user
        })
        await this.tokenRepo.save(token)
        return { user, accessToken, refreshToken }
    }

    async signin(data: LoginDto) {
        if (!data.email || !data.password) throw new BadRequestException('Password and Email is requred')
        const user = await this.userService.findUserByEmail(data.email)
        if (!user) throw new UnauthorizedException('Invalid email or password')
        const verify = await bcrypt.compare(data.password, user.password)
        if (!verify) throw new UnauthorizedException('Invalid email or password')
        const accessToken = await generateAccessToken(this.jwt, {
            id: user.id,
            email: user.email,
            role: user.role
        })
        const refreshToken = await generateRefreshToken(this.jwt, user)
        const expiresAt = new Date(Date.now() + Number(process.env.JWT_REFRESH_TIME))
        const token = this.tokenRepo.create({
            tokenHash: refreshToken,
            expiresAt,
            user
        })
        await this.tokenRepo.save(token)
        return { user, accessToken, refreshToken }
    }

    async refresh(refreshToken: string) {
        const token = await this.tokenRepo.findOne({
            where: { tokenHash: refreshToken },
            relations: ['user']
        })
        if (!token) throw new UnauthorizedException('Invalid Refresh Token')
        const user = token.user
        await this.tokenRepo.remove(token)
        const accessToken = await generateAccessToken(this.jwt, {
            id: user.id,
            email: user.email,
            role: user.role
        })
        const newRefreshToken = await generateRefreshToken(this.jwt, user)
        const expiresAt = new Date(Date.now() + ms((process.env.JWT_REFRESH_TIME) as StringValue))
        const newToken = this.tokenRepo.create({
            tokenHash: newRefreshToken,
            expiresAt,
            user
        })
        await this.tokenRepo.save(newToken)
        return { success: true, accessToken, refreshToken: newRefreshToken }
    }

    async logout(refreshToken: string) {
        const result = await this.tokenRepo.update(
            { tokenHash: refreshToken, revoke: false },
            { revoke: true }
        )
        if (result.affected === 0) throw new UnauthorizedException('Invalid or alreay revoked token')
        return { message: 'You have logged out' }
    }

    async logoutall(userId: number) {
        const result = await this.tokenRepo.update(
            { user: { id: userId }, revoke: false },
            { revoke: true }
        )
        if (result.affected === 0) throw new UnauthorizedException('Invalid or already revoked token')
        return { message: 'You have logged out from all devices' }
    }
}
