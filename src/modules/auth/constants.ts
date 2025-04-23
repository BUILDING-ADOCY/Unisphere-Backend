// src/modules/auth/constants.ts

import * as dotenv from 'dotenv';
dotenv.config();

/**
 * We pull JWT_SECRET from your .env (make sure you have one),
 * or fall back to a hard-coded default.
 */
export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'change-me-in-.env',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  }
