import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Get('/all')
    getAllUsers() {
        return this.userService.getUsers()
    }

    @Get('/id')
    findUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findUser(id)
    }

    @Delete('/:id')
    removeUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id)
    }
}
