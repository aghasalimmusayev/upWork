import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization
        if (!authHeader) throw new UnauthorizedException('You have to login')
        const token = authHeader.split(' ')[1]
        if (!token) throw new UnauthorizedException('Token is missing')
        try {
            const payload = await this.jwtService.verifyAsync(
                token, { secret: process.env.JWT_ACCESS_SECRET ?? 'here_is_my_access_code' }
            )
            request.user = payload
        } catch (err) {
            throw new UnauthorizedException('Invalid or Expired token')
        }
        return true
    }
}