import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../types';
import { JWTPayload, UserRole } from '../types';

/**
 * Extend Express Request type sa user property
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication Middleware
 * Verifikuje JWT token iz cookies ili Authorization header-a
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Proveri Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Proveri cookies (za browser requests)
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Kein Authentifizierungstoken gefunden');
    }

    // Verifikuj token
    const payload = verifyAccessToken(token);

    // Dodaj payload u request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Ungültiger oder abgelaufener Token'));
    }
  }
};

/**
 * Authorization Middleware
 * Provera da li user ima potrebne role
 * @param allowedRoles - Array dozvoljenih rola
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Benutzer nicht authentifiziert');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Sie haben keine Berechtigung für diese Aktion');
    }

    next();
  };
};

/**
 * Optional Authentication
 * Verifikuje token ako postoji, ali ne baca grešku ako ne postoji
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch {
    // Ignoriši greške - token je optional
    next();
  }
};
