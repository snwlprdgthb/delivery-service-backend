import { Injectable, Inject } from '@nestjs/common';
import { JwtOptions } from './interfaces/jwt-module-options.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(@Inject('BANANAS') private readonly options: JwtOptions) {
    // console.log(this.options);
  }
  sign(id: object) {
    return jwt.sign(id, this.options.SecretKey);
  }

  verify(token: string) {
    return jwt.verify(token, this.options.SecretKey);
  }
}
