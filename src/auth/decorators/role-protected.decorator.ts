import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles.enum';

export const ROLES_KEY = 'roles';

export const RoleProtected = (...roles: ValidRoles[]) => {
    
    return SetMetadata(ROLES_KEY, roles);
}