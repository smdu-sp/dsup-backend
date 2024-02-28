// NestJS
import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AuthGuard } from '@nestjs/passport';
  import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
  
  @Injectable()
  export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {
    constructor(private reflector: Reflector) {
      super();
    }
  }
  