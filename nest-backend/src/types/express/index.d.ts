import type { JWTPayload } from '../../auth.guard';

declare global {
  namespace Express {
    export interface Request {
      user?: JWTPayload;
    }
  }
}
