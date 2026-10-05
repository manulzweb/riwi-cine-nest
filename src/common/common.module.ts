// src/common/common.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CsrfService } from './csrf/csrf.service';
import { CsrfGuard } from './csrf/csrf.guard';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [CsrfService, CsrfGuard, AuthGuard, RolesGuard],
  exports: [CsrfService, CsrfGuard, AuthGuard, RolesGuard, JwtModule],
})
export class CommonModule {}
