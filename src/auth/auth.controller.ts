import { Body, Controller, Post, Res } from "@nestjs/common";
import { EmailsService } from "src/emails/emails.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post("send-verify-email")
  async sendVerificationEmail(@Body("email") email: string) {
    let user = await this.usersService.findUserByEmail(email);
    if (!user) user = await this.usersService.createUser(email);
    const token = await this.authService.generateVerificationToken(user.id);
    await this.emailsService.sendVerificationEmail(email, token);

    return { message: "Verification email sent successfully" };
  }

  @Post("verify-email")
  async verifyEmail(
    @Body("token") token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { userId } = await this.authService.verifyEmailToken(token);

    await this.prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    const sessionToken = await this.authService.generateSessionToken(userId);

    response.cookie("token", `${sessionToken.token}.${sessionToken.id}`, {
      // todo work on expiring cookies
      // maxAge: 1000 * 60 * 60 * 24, // 1 day
      // expires
      // expires
      httpOnly: true,
      secure: false,
      // lax for development, none with secure for production
      sameSite: "lax",
      path: "/",
    });
    return { message: "Email verified successfully" };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("token");
    return { message: "Logged out successfully" };
  }
}
