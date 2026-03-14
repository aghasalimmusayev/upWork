import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";

export class CreateProposalDto {
    @ApiProperty()
    @IsString()
    coverLetter: string

    @ApiProperty()
    @IsNumber()
    @Min(1)
    amount: number

    @ApiProperty()
    @IsNumber()
    @Min(1)
    estimatedDays: number
}