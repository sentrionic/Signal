import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { getTokenFromCookie } from '../utils/getTokenFromCookie';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const token = getTokenFromCookie(context.switchToWs().getClient());

    try {
      jwt.verify(token, this.configService.getOrThrow<string>('SESSION_SECRET'));
      return true;
    } catch (err) {
      return false;
    }
  }
}
