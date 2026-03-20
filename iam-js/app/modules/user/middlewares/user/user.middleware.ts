import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from '@user/services/user/user.service';
import { NextFunction, Request } from 'express';
import { User } from '@user/entities/user.entity';

export interface ExtendedRequest extends Request {
  tokenPayload?: { sub: string };
  user?: User;
}

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}

  async use(req: ExtendedRequest, _: Response, next: NextFunction): Promise<void> {
    const payload = req.tokenPayload;

    if (!payload) return next();

    req.user = await this.userService.findOne(payload.sub);

    return next();
  }
}
