import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Get refresh token from cookies or body
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: 'Refresh-Token nicht gefunden',
    });
    return;
  }

  try {
    const result = authService.refreshAccessToken(refreshToken);

    // Set new HTTP-Only cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Token erfolgreich aktualisiert',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Ungültiger oder abgelaufener Refresh-Token',
    });
  }
});
