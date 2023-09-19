import { Module } from '@nestjs/common';
import { AuthenticationGateway } from './authentication.gateway';
import { StubAuthenticationGateway } from './stub-authentication.gateway';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    AuthGuard,
    {
      provide: AuthenticationGateway,
      useClass: StubAuthenticationGateway,
    },
  ],
  exports: [AuthenticationGateway],
})
export class AuthModule {}
