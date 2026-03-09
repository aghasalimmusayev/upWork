import { Request } from "express"
import { User } from "./Entities/user.entity"

export type JwtPayload = { id: number, email: string, role: 'CLIENT' | 'FREELANCER' }

export type SessionData = { userId: number | null }

export interface AuthRequest extends Request {
    user?: User
}