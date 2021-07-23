import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { allowedRoles } from './role-decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly JwtService: JwtService,
    private readonly UserService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<allowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();

    const token = gqlContext.token;

    if (!token) {
      return false;
    } else {
      const decoded = this.JwtService.verify(token.toString());

      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const user = await this.UserService.findById(decoded['id']);
        if (!user) {
          return false;
        }

        gqlContext['user'] = user;
        if (roles.includes('Any')) {
          return true;
        }
        return roles.includes(user.role);
      }
    }

    // const user = gqlContext['user'];
  }
}
