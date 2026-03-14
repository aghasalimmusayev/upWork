import { IsEnum } from "class-validator";
import { statusProposal } from "../type";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateStatusProposal {
    @ApiProperty()
    @IsEnum(statusProposal)
    status: statusProposal
}