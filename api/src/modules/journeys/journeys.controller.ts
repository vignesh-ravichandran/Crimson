// Journeys Controller
// Based on design/api-specification.md Section 2

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import crypto from 'crypto';

export async function createJourney(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const { title, description, isPublic, dimensions } = req.body;

    // Validation
    if (!title || title.length < 3 || title.length > 100) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Title must be 3-100 characters' }
      });
    }

    if (!dimensions || !Array.isArray(dimensions) || dimensions.length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'At least 1 dimension required' }
      });
    }

    // Validate dimensions
    for (const dim of dimensions) {
      if (!dim.name || dim.name.length === 0) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Dimension name required' }
        });
      }
      if (dim.weight < 1 || dim.weight > 5) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Dimension weight must be 1-5' }
        });
      }
    }

    // Create journey with dimensions and add creator as owner
    const journey = await prisma.journey.create({
      data: {
        title,
        description,
        isPublic: isPublic || false,
        createdBy: req.user.id,
        dimensions: {
          create: dimensions.map((dim: any, index: number) => ({
            name: dim.name,
            description: dim.description,
            examples: dim.examples || [],
            weight: dim.weight,
            displayOrder: dim.displayOrder !== undefined ? dim.displayOrder : index
          }))
        },
        members: {
          create: {
            userId: req.user.id,
            role: 'owner'
          }
        }
      },
      include: {
        dimensions: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    logger.info(`Journey created: ${journey.id} by user ${req.user.id}`);

    return res.status(201).json({
      data: {
        ...journey,
        memberCount: 1
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Create journey error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create journey' }
    });
  }
}

export async function getJourneys(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const isPublic = req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined;
    const memberOnly = req.query.memberOnly === 'true';
    const excludeCheckedInDate = req.query.excludeCheckedInDate as string; // YYYY-MM-DD format
    const q = req.query.q as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'active'
    };

    // Handle memberOnly first (highest priority)
    if (memberOnly && req.user) {
      // ONLY show journeys user is a member of
      where.members = { some: { userId: req.user.id } };
    } 
    // If not memberOnly, handle public filter
    else if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }
    // Otherwise, if user is authenticated, include their private journeys
    else if (req.user) {
      where.OR = [
        { isPublic: true },
        { members: { some: { userId: req.user.id } } }
      ];
    }

    // Add search query (works with any of the above)
    if (q) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      });
    }

    // Exclude journeys already checked in for a specific date
    if (excludeCheckedInDate && req.user) {
      const checkinDate = new Date(excludeCheckedInDate);
      if (!isNaN(checkinDate.getTime())) {
        where.AND = where.AND || [];
        where.AND.push({
          NOT: {
            checkins: {
              some: {
                userId: req.user.id,
                date: checkinDate
              }
            }
          }
        });
      }
    }

    const [journeys, totalCount] = await Promise.all([
      prisma.journey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          },
          _count: {
            select: {
              members: true,
              dimensions: true
            }
          },
          members: req.user ? {
            where: { userId: req.user.id },
            select: { role: true }
          } : false
        }
      }),
      prisma.journey.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      data: journeys.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description,
        isPublic: j.isPublic,
        status: j.status,
        createdBy: j.creator,
        memberCount: j._count.members,
        dimensionCount: j._count.dimensions,
        createdAt: j.createdAt,
        userIsMember: req.user ? j.members.length > 0 : false,
        userRole: req.user && j.members.length > 0 ? j.members[0].role : null
      })),
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
          totalItems: totalCount
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Get journeys error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch journeys' }
    });
  }
}

export async function getJourneyById(req: AuthRequest, res: Response) {
  try {
    const { journeyId } = req.params;

    const journey = await prisma.journey.findUnique({
      where: { id: journeyId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        dimensions: {
          orderBy: { displayOrder: 'asc' }
        },
        _count: {
          select: {
            members: true,
            checkins: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!journey) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Journey not found' }
      });
    }

    // Check if current user is a member
    const currentUserMembership = journey.members.find(m => m.userId === req.user?.id);
    
    // Check access for private journeys
    if (!journey.isPublic && req.user) {
      if (!currentUserMembership) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Access denied to private journey' }
        });
      }
    } else if (!journey.isPublic && !req.user) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Private journey requires authentication' }
      });
    }

    // Get stats
    const lastCheckin = await prisma.checkin.findFirst({
      where: { journeyId: journey.id },
      orderBy: { date: 'desc' },
      select: { date: true }
    });

    const avgScore = await prisma.checkin.aggregate({
      where: { journeyId: journey.id },
      _avg: { totalScore: true }
    });

    // Get current user's streak for this journey
    let currentStreak = 0;
    if (req.user && currentUserMembership) {
      const streak = await prisma.streak.findUnique({
        where: {
          userId_journeyId: {
            userId: req.user.id,
            journeyId: journey.id
          }
        }
      });
      currentStreak = streak?.currentStreak || 0;
      
      logger.info('Streak data for user', {
        userId: req.user.id,
        journeyId: journey.id,
        streak: streak,
        currentStreak
      });
    }

    const stats = {
      totalCheckins: journey._count.checkins,
      avgScore: Number(avgScore._avg.totalScore) || 0,
      lastCheckinDate: lastCheckin?.date,
      currentStreak
    };

    logger.info('Journey stats calculated', {
      journeyId: journey.id,
      stats,
      avgScoreRaw: avgScore._avg.totalScore
    });

    // Format members with user details
    const formattedMembers = journey.members.map(m => ({
      id: m.user.id,
      username: m.user.username,
      displayName: m.user.displayName,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.joinedAt
    }));

    return res.json({
      data: {
        ...journey,
        members: formattedMembers,
        memberCount: journey._count.members,
        stats
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Get journey error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch journey' }
    });
  }
}

export async function joinJourney(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const { journeyId } = req.params;
    const { inviteToken } = req.body;

    const journey = await prisma.journey.findUnique({
      where: { id: journeyId },
      select: { isPublic: true, status: true }
    });

    if (!journey) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Journey not found' }
      });
    }

    if (journey.status !== 'active') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Journey is not active' }
      });
    }

    // Check if already a member
    const existing = await prisma.journeyMember.findUnique({
      where: {
        journeyId_userId: {
          journeyId,
          userId: req.user.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Already a member of this journey' }
      });
    }

    // For private journeys, validate invite token
    if (!journey.isPublic) {
      if (!inviteToken) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Invite token required for private journey' }
        });
      }

      const invite = await prisma.journeyInvite.findFirst({
        where: {
          token: inviteToken,
          journeyId,
          status: 'pending',
          expiresAt: { gt: new Date() }
        }
      });

      if (!invite) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Invalid or expired invite token' }
        });
      }

      // Mark invite as accepted
      await prisma.journeyInvite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date()
        }
      });
    }

    // Add user as member
    const member = await prisma.journeyMember.create({
      data: {
        journeyId,
        userId: req.user.id,
        role: 'member'
      }
    });

    logger.info(`User ${req.user.id} joined journey ${journeyId}`);

    return res.status(201).json({
      data: member,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Join journey error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to join journey' }
    });
  }
}

export async function sendInvite(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    const { journeyId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' }
      });
    }

    // Check if user is the owner
    const member = await prisma.journeyMember.findUnique({
      where: {
        journeyId_userId: {
          journeyId,
          userId: req.user.id
        }
      }
    });

    if (!member || member.role !== 'owner') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only journey owner can send invites' }
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await prisma.journeyInvite.create({
      data: {
        journeyId,
        invitedBy: req.user.id,
        email,
        token,
        expiresAt
      }
    });

    logger.info(`Invite sent for journey ${journeyId} to ${email}`);

    // TODO: Send email notification (future enhancement)

    return res.status(201).json({
      data: {
        id: invite.id,
        journeyId: invite.journeyId,
        email: invite.email,
        token: invite.token,
        expiresAt: invite.expiresAt,
        status: invite.status
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    logger.error('Send invite error:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to send invite' }
    });
  }
}

