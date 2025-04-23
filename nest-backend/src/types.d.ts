import type { JWTPayload } from './auth.guard';

declare namespace Express {
  export interface Request {
    user?: JWTPayload;
  }
}
