import { Injectable } from '@nestjs/common';

export type User = {
  uid: string;
};

@Injectable()
export abstract class AuthenticationGateway {
  abstract getUser(token: string): Promise<User>;
}
