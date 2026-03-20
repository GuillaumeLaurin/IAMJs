import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from '@user/services/user/user.service';
import { NextFunction } from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const payload = req['tokenPayload'];

    if (!payload) return next();

    req['user'] = await this.userService.findOne(payload.sub);

    next();
  }
}
