import { randomUUID, randomBytes } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthTokens, AuthTokenType, Session } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async generateVerificationToken(
    userId: string,
    // type: AuthTokenType,
  ): Promise<string> {
    const token = randomUUID(); // Generate a unique token
    await this.prisma.authTokens.create({
      data: {
        userId,
        token,
        type: AuthTokenType.EMAIL_VERIFICATION,
        // isn't it too long?
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiration
      },
    });
    return token;
  }

  async verifyEmailToken(token: string): Promise<AuthTokens> {
    try {
      const authToken = await this.prisma.authTokens.delete({
        where: {
          token,
          type: AuthTokenType.EMAIL_VERIFICATION,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      return authToken;
    } catch (error) {
      console.error("Error verifying email token:", error);
      throw new NotFoundException("Token not found or expired");
    }
  }

  async generateSessionToken(userId: string): Promise<Session> {
    const token = randomBytes(32).toString("hex"); // Generate a unique token
    return await this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour expiration
      },
    });
  }
}
