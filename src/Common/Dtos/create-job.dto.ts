import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { PaymentType } from "../type";

export class CreateJobDto {
    @ApiProperty()
    @IsString()
    title: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty()
    @IsEnum(PaymentType)
    paymentType: PaymentType

    @ApiProperty()
    @IsNumber()
    @MinLength(1)
    price: number

    @ApiProperty()
    @IsString()
    category: string

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    skills: string[]
}