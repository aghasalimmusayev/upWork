import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
        const token = await this.tokenRepo.findOne({ where: { tokenHash: refreshToken } })
        if (!token) throw new UnauthorizedException('No Refresh Token')
        const accessToken = await generateAccessToken(this.jwt, {
            id: token.user.id,
            email: token.user.email,
            role: token.user.role
        })
        return { success: true, accessToken }
    }
}
