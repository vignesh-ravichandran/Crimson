// Authentication Controller
// Based on design/authentication.md

import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleOAuthLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Token is required'
        }
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required from Google'
        }
      });
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { oauthProviderId: googleId }
        ]
      }
    });

    if (!user) {
      // Create new user
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 6);
      
      user = await prisma.user.create({
        data: {
          email,
          username,
          displayName: name || username,
          avatarUrl: picture,
          oauthProvider: 'google',
          oauthProviderId: googleId
        }
      });

      logger.info(`New user created: ${user.id} (${user.email})`);
    } else if (!user.oauthProviderId) {
      // Link OAuth to existing email user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: 'google',
          oauthProviderId: googleId,
          avatarUrl: picture || user.avatarUrl
        }
      });

      logger.info(`User linked to Google OAuth: ${user.id}`);
    }

    // Generate JWT
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() }
    });

    logger.info(`User logged in: ${user.id} (${user.email})`);

    return res.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          settings: user.settings
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('OAuth error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

