import { Body, Controller, Post, Res, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/Common/Dtos/create-user.dto';
import type { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('auth')
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
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return { user, accessToken }
    }

}
