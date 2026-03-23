import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ChangePassword {
    @ApiProperty()
    @IsString()
    @MinLength(8)
    oldPassword: string

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string
}