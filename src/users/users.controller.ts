import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/Common/Dtos/update-user.dto';
import { ChangePassword } from 'src/Common/Dtos/change-password.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from 'src/Common/Dtos/user-dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }
    
    @Get('/all')
    @Serialize(UserDto)
    getAllUsers() {
        return this.userService.getUsers()
    }

    @Get('/:id')
    @Serialize(UserDto)
    findUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findUser(id)
    }

    @Patch('/:id')
    @Serialize(UserDto)
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.userService.update(id, body)
    }

    @Patch('/password/:id') //! evvelce logoutall edilmelidir,sonra password deyisdirilmelidir
    updatePassword(@Param('id', ParseIntPipe) id: number, @Body() body: ChangePassword) {
        return this.userService.updatePassword(id, body.password)
    }

    @Delete('/:id')
    removeUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id)
    }
}
