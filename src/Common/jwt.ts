import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "./type";
import { User } from "./Entities/user.entity";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'here_access_code'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'here_refresh_secret_code'

export const generateAccessToken = (payload: JwtPayload): string => {
    const option: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
    console.log(process.env.JWT_EXPIRES_IN)
    return jwt.sign(payload, JWT_ACCESS_SECRET, option)
}

export const generateRefreshToken = (user: User): string => {
    const option: SignOptions = { expiresIn: process.env.JWT_REFRESH_TTL as SignOptions['expiresIn'] }
    return jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, option)
}

