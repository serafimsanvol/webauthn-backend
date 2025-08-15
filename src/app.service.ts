import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(name): { message: string } {
    return { message: `Hello ${name}!` };
  }
}
