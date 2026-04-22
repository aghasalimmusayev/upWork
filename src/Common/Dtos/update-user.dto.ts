import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    surname?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    role?: 'CLIENT' | 'FREELANCER'

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string

}