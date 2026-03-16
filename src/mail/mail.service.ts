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
}
