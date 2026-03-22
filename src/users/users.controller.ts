import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/Common/Dtos/update-user.dto';
import { ChangePassword } from 'src/Common/Dtos/change-password.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from 'src/Common/Dtos/user-dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { User } from 'src/Common/Entities/user.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Get('/all')
    @Roles('ADMIN')
    @Serialize(UserDto)
    getAllUsers() {
        return this.userService.getUsers()
    }

    @Patch('/:id')
    @Serialize(UserDto)
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto, @CurrentUser() user: User) {
        return this.userService.update(id, body, user.id)
    }

    @Patch('/password/:id')
    updatePassword(@Param('id', ParseIntPipe) id: number, @Body() body: ChangePassword, @CurrentUser() user: User) {
        return this.userService.updatePassword(id, body.password, user.id)
    }

    @Delete('/:id')
    removeUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        return this.userService.remove(id, user.id)
    }
}
