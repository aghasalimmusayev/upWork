import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    name: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    surname: string

    @ApiProperty()
    @IsString()
    role: 'CLIENT' | 'FREELANCER'

    @ApiProperty()
    @IsOptional()
    @IsString()
    phone?: string

}