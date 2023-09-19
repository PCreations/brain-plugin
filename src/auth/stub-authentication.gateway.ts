import { AuthenticationGateway, User } from './authentication.gateway';

export class StubAuthenticationGateway implements AuthenticationGateway {
  static BOB_TEST_TOKEN_AND_UID = 'bob';
  private users = new Map<string, User>([
    ['alice', { uid: 'alice' }],
    [StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID, { uid: 'bob' }],
    ['charles', { uid: 'charles' }],
  ]);

  getUser(token: string): Promise<User> {
    const user = this.users.get(token);
    if (!user) {
      throw new Error('No users found');
    }

    return Promise.resolve(user);
  }
}
