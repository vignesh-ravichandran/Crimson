// Database Seed Script
// Based on design/gamification-engine.md

import { prisma } from './prisma';
import { logger } from './logger';

const BADGES = [
  // Streak badges
  {
    key: 'streak_3',
    name: 'Getting Started',
    description: "You're building the habit!",
    criteria: { type: 'streak', days: 3 },
    tier: 'bronze',
    iconUrl: '/assets/badges/streak-3.svg'
  },
  {
    key: 'streak_7',
    name: 'Week Warrior',
    description: 'One full week of consistency!',
    criteria: { type: 'streak', days: 7 },
    tier: 'silver',
    iconUrl: '/assets/badges/streak-7.svg'
  },
  {
    key: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Two weeks strong!',
    criteria: { type: 'streak', days: 14 },
    tier: 'silver',
    iconUrl: '/assets/badges/streak-14.svg'
  },
  {
    key: 'streak_30',
    name: 'Month Master',
    description: 'A full month of dedication!',
    criteria: { type: 'streak', days: 30 },
    tier: 'gold',
    iconUrl: '/assets/badges/streak-30.svg'
  },
  {
    key: 'streak_100',
    name: 'Century Club',
    description: 'Elite consistency!',
    criteria: { type: 'streak', days: 100 },
    tier: 'platinum',
    iconUrl: '/assets/badges/streak-100.svg'
  },

  // Performance badges
  {
    key: 'beast_mode',
    name: 'Beast Mode',
    description: 'You dominated this week!',
    criteria: { type: 'crushed_count', count: 3, period: 'week' },
    tier: 'gold',
    iconUrl: '/assets/badges/beast-mode.svg'
  },
  {
    key: 'perfect_week',
    name: 'Perfect Week',
    description: 'Flawless execution!',
    criteria: { type: 'perfect_week', min_effort_level: 4, days: 7 },
    tier: 'gold',
    iconUrl: '/assets/badges/perfect-week.svg'
  },

  // Milestone badges
  {
    key: 'first_checkin',
    name: 'First Step',
    description: 'Your journey begins!',
    criteria: { type: 'milestone', event: 'first_checkin' },
    tier: 'bronze',
    iconUrl: '/assets/badges/first-step.svg'
  },
  {
    key: 'journey_creator',
    name: 'Journey Starter',
    description: 'Leading the way!',
    criteria: { type: 'milestone', event: 'create_journey' },
    tier: 'bronze',
    iconUrl: '/assets/badges/journey-starter.svg'
  },
  {
    key: 'climber',
    name: 'Climber',
    description: "You're leveling up!",
    criteria: { type: 'improvement', percentage: 20, comparison: 'previous_week' },
    tier: 'silver',
    iconUrl: '/assets/badges/climber.svg'
  }
];

async function seed() {
  try {
    logger.info('🌱 Starting database seed...');

    // Clear existing badges (optional - comment out in production)
    await prisma.badge.deleteMany({});
    logger.info('Cleared existing badges');

    // Create badges
    for (const badge of BADGES) {
      await prisma.badge.create({
        data: badge
      });
      logger.info(`✅ Created badge: ${badge.name}`);
    }

    logger.info(`✅ Successfully seeded ${BADGES.length} badges`);
    logger.info('🌱 Seed completed!');
  } catch (error) {
    logger.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seed()
  .catch((error) => {
    logger.error('Fatal error during seed:', error);
    process.exit(1);
  });

