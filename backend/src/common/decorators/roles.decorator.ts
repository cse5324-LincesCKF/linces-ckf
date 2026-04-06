import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants/roles.constant';
import { ROLES_KEY } from '../constants/auth.constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
