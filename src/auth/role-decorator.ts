import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/users.module.entity';
import { AnyARecord } from 'dns';

export type allowedRoles = keyof typeof UserRole | 'Any';

export let roleDec = (roles: allowedRoles[]) => {
  return SetMetadata('roles', roles);
};
