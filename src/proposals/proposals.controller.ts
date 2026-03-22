import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { User } from 'src/Common/Entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateProposalDto } from 'src/Common/Dtos/createProposal.dto';
import { UpdateProposalDto } from 'src/Common/Dtos/updateProposal.dto';
import { statusProposal } from 'src/Common/type';
import { UpdateStatusProposal } from 'src/Common/Dtos/update-StatusProposal.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('proposals')
export class ProposalsController {
    constructor(private proposalService: ProposalsService) { }

    @Post('/jobs/:jobId')
    @UseInterceptors(ClassSerializerInterceptor)
    createProp(@Body() body: CreateProposalDto, @CurrentUser() user: User, @Param('jobId', ParseIntPipe) jobId: number) {
        return this.proposalService.create(body, user.id, jobId)
    }

    @Get()
    getProposals(@CurrentUser() user: User) {
        return this.proposalService.getProposals(user.id, user.role)
    }

    @Get('/:id')
    findProposal(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        return this.proposalService.findProposal(user.id, id)
    }

    @Patch('/:id')
    updateProposal(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProposalDto, @CurrentUser() user: User) {
        return this.proposalService.updateProposal(body, id, user.id, user.role)
    }

    @Patch('/status/:id')
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStatusProposal, @CurrentUser() user: User) {
        return this.proposalService.updateStatus(body.status, id, user.id, user.role)
    }

    @Delete('/:id')
    removeProposal(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
        return this.proposalService.delete(id, user.id, user.role)
    }

    @Delete('/admin/:id')
    removeByAdmin(@Param('id', ParseIntPipe) id: number) {
        return this.proposalService.adminDelete(id)
    }
}
