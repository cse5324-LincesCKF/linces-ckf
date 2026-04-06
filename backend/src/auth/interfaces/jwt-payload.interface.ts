import { UserRole } from '../../common/constants/roles.constant';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
