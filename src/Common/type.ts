export type JwtPayload = { id: number, email: string, role: 'CLIENT' | 'FREELANCER' }

export type SessionData = { userId: number | null }
