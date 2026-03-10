import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { PaymentType } from "../type"

export class UpdateJobDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string

    @ApiPropertyOptional()
    @IsEnum(PaymentType)
    @IsOptional()
    paymentType?: PaymentType

    @ApiPropertyOptional()
    @IsNumber()
    @Min(1)
    @IsOptional()
    price?: number

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    category?: string

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[]
}