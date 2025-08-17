import { randomUUID, randomBytes } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthToken, AuthTokenType, Session } from "@prisma/client";

const HOUR_IN_MS = 3600 * 1000; // 1 hour in milliseconds

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async generateVerificationToken(userId: string): Promise<string> {
    const token = randomUUID(); // Generate a unique token

    await this.prisma.authToken.create({
      data: {
        userId,
        token,
        type: AuthTokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + HOUR_IN_MS), // 1 hour expiration
      },
    });
    return token;
  }

  async verifyEmailToken(token: string): Promise<AuthToken> {
    try {
      const authToken = await this.prisma.authToken.delete({
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
        expiresAt: new Date(Date.now() + HOUR_IN_MS), // 1 hour expiration
      },
    });
  }
}
