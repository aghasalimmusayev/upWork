import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from 'src/Common/Entities/token.entity';
import { CleanupService } from './cleanup.service';

@Module({
    imports: [TypeOrmModule.forFeature([TokenEntity])],
    providers: [CleanupService]
})
export class CleanupModule { }
