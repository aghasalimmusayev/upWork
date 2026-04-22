import { JwtPayload } from "./type";
import { User } from "./Entities/user.entity";
import { JwtService } from "@nestjs/jwt";

export const generateAccessToken = (jwt: JwtService, payload: JwtPayload): Promise<string> => {
    return jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: (process.env.JWT_ACCESS_TIME ?? '15m') as any
    })
}

export const generateRefreshToken = (jwt: JwtService, user: User): Promise<string> => {
    return jwt.signAsync(
        { id: user.id },
        {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: (process.env.JWT_REFRESH_TIME ?? '7d') as any
        }
    )
}