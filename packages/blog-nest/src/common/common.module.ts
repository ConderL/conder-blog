import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GuardsProvider } from './providers/guards.provider';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    ...GuardsProvider,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [...GuardsProvider],
})
export class CommonModule {}
