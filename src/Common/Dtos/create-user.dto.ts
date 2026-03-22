import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

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
    name: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    surname?: string

    @ApiProperty()
    @IsIn(['CLIENT', 'FREELANCER'])
    role: 'CLIENT' | 'FREELANCER'

    @ApiProperty()
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string

}