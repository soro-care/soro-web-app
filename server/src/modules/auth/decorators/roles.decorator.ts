// src/modules/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// src/modules/auth/decorators/current-user.decorator.ts

// Usage examples:
// @CurrentUser() user: any
// @CurrentUser('userId') userId: string
// @CurrentUser('email') email: string
