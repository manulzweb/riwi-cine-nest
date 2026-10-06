// src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/public-key.constant.js';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
