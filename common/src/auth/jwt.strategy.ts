import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

interface TokenPayload {
  userId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies['sgl'] ?? '';
        },
      ]),
      secretOrKey: process.env.SESSION_SECRET,
    });
  }

  async validate({ userId }: TokenPayload) {
    return userId;
  }
}
