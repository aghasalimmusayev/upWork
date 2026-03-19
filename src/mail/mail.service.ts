import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendWelcome(email: string, name: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome',
            template: './welcome',
            context: { name }
        })
    }

    async sendNotifyProposal(clientEmail: string, clientName: string, freelancerName: string, jobTitle: string) {
        await this.mailerService.sendMail({
            to: clientEmail,
            subject: 'Recieved a new Proposal',
            template: './proposal',
            context: { clientName, freelancerName, jobTitle }
        })
    }

    async sendNotifyProposalStatus(freelancerEmail: string, freelancerName: string, jobStatus: string, jobTitle: string) {
        await this.mailerService.sendMail({
            to: freelancerEmail,
            subject: 'Your Proposal status updated',
            template: './proposalStatus',
            context: { jobStatus, jobTitle, freelancerName }
        })
    }
}
