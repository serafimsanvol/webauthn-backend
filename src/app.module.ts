import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { EmailsService } from "./emails/emails.service";
import { AuthModule } from "./auth/auth.module";
import { EmailsModule } from "./emails/emails.module";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().default(3000),
        RESEND_API_KEY: Joi.string().required(),
        FE_ORIGIN: Joi.string().uri().default("http://localhost:5173"),
        RECIPIENT_EMAIL: Joi.string().required().email(),
      }),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EmailsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailsService],
})
export class AppModule {}
