import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private refloctor: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.refloctor.get<string[]>('roles', context.getHandler())
        if (!roles) return true

        const request = context.switchToHttp().getRequest()
        const user = request.user

        if (!user || !roles.includes(user.role)) throw new ForbiddenException('You have no access')
        return true
    }
}

