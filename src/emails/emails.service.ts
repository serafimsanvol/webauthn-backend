import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailsService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendVerificationEmail(email: string, token: string) {
    console.log(email, token, process.env.RESEND_API_KEY);
    const result = await this.resend.emails.send({
      // default from address for Resend
      from: "onboarding@resend.dev",
      to: process.env.RECIPIENT_EMAIL || email,
      subject: "Verify your email",
      html:
        "<p>Click the link below to verify your email:</p>" +
        `<a href="${process.env.FE_ORIGIN}/passkey?token=${token}">Verify Email</a>`,
    });
    return result;
  }
}
