import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class UpdateProposalDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    coverLetter?: string

    @ApiPropertyOptional()
    @IsNumber()
    @Min(1)
    @IsOptional()
    amount?: number

    @ApiPropertyOptional()
    @IsNumber()
    @Min(1)
    @IsOptional()
    estimatedDays?: number
}