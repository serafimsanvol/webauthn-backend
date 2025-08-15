import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

type CookieRequest = Request & {
  signedCookies?: Record<string, string>;
  cookies?: Record<string, string>;
};

export const Token = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<CookieRequest>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return request.cookies?.token || request.signedCookies?.token || "";
  },
);
