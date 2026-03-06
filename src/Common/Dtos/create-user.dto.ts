import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    surname: string

    @ApiProperty()
    @IsString()
    role: 'CLIENT' | 'FREELANCER'

    @ApiProperty()
    @ApiPropertyOptional()
    @IsString()
    phone?: string

}