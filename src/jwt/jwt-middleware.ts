import { NestMiddleware, Injectable } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { JwtService } from './jwt.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly JwtService: JwtService,
    private readonly UserService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const isVerify = this.JwtService.verify(token.toString());
        // if ok isVerify = { id, ...other}
        if (typeof isVerify === 'object' && isVerify.hasOwnProperty('id')) {
          const isUser = await this.UserService.findById(isVerify['id']);
          //   console.log(isUser);
          req['user'] = isUser;
        }
      } catch (e) {
        console.log(e);
      }
    }
    next();
  }
}

// export function JwtMiddleware(req: Request, res: Response, next: NextFunction) {
//   console.log(req.headers);
//   next();
// }
