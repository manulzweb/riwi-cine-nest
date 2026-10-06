// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/roles-key.constant.js';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
