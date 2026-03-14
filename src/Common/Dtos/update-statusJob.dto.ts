import { IsEnum } from "class-validator";
import { statusJob } from "../type";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateStatusJob {
    @ApiProperty()
    @IsEnum(statusJob)
    status: statusJob
}