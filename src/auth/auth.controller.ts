import { Body, Controller, Post, Res, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/Common/Dtos/create-user.dto';
import type { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from 'src/Common/Dtos/login.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import ms, { StringValue } from 'ms'
import { AuthResponseDto } from 'src/Common/Dtos/auth-response.dto';

@ApiBearerAuth()
@Controller('auth')
@Serialize(AuthResponseDto)
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/signup')
    async register(@Body() body: CreateUserDto, @Res({ passthrough: true }) res: Response) {
        const { user, accessToken, refreshToken } = await this.authService.signup(body)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/auth/refresh',
            maxAge: ms((process.env.JWT_REFRESH_TIME ?? '7d') as StringValue)
        })
        return { user, accessToken }
    }

    @Post('/signin')
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { user, accessToken, refreshToken } = await this.authService.signin(body)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/auth/refresh',
            maxAge: ms((process.env.JWT_REFRESH_TIME ?? '7d') as StringValue)
        })
        return { user, accessToken }
    }

}
