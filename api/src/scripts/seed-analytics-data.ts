import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Effort level to score mapping
// 0 = Skip (penalty), 1 = Minimal, 2 = Moderate, 3 = Strong, 4 = Maximum
const EFFORT_SCORE_MAP: Record<number, number> = {
  0: -1.0,  // Skip (penalty)
  1: 0.5,   // Minimal
  2: 1.5,   // Moderate
  3: 2.5,   // Strong
  4: 3.5    // Maximum
};

async function main() {
  console.log('🌱 Seeding analytics data...');

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: 'vigneshravichandran27@gmail.com' }
  });

  if (!user) {
    console.error('❌ User not found with email: vigneshravichandran27@gmail.com');
    console.log('Available users:');
    const users = await prisma.user.findMany({ select: { email: true, username: true } });
    users.forEach(u => console.log(`  - ${u.email} (${u.username})`));
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email} (${user.username})`);

  // Create a new journey with 6 dimensions
  const journey = await prisma.journey.create({
    data: {
      title: '🎯 Complete Wellness Journey',
      description: 'A comprehensive 6-dimension wellness program tracking physical health, mental wellbeing, nutrition, sleep, social connections, and personal growth.',
      isPublic: true,
      status: 'active',
      createdBy: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner'
        }
      },
      dimensions: {
        create: [
          {
            name: 'Physical Exercise',
            description: 'Cardio, strength training, and flexibility work',
            weight: 5,
            displayOrder: 1
          },
          {
            name: 'Mental Wellness',
            description: 'Meditation, mindfulness, and stress management',
            weight: 4,
            displayOrder: 2
          },
          {
            name: 'Nutrition',
            description: 'Healthy eating, meal planning, and hydration',
            weight: 5,
            displayOrder: 3
          },
          {
            name: 'Sleep Quality',
            description: 'Sleep duration, consistency, and restfulness',
            weight: 4,
            displayOrder: 4
          },
          {
            name: 'Social Connection',
            description: 'Quality time with friends and family',
            weight: 3,
            displayOrder: 5
          },
          {
            name: 'Personal Growth',
            description: 'Learning, reading, and skill development',
            weight: 3,
            displayOrder: 6
          }
        ]
      }
    },
    include: {
      dimensions: true
    }
  });

  console.log(`✅ Created journey: "${journey.title}" with ${journey.dimensions.length} dimensions`);

  // Seed 60 days of check-in data
  const daysToSeed = 60;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`📅 Seeding ${daysToSeed} days of check-in data...`);

  // Create realistic patterns
  // - Weekends tend to have lower scores
  // - Some dimensions vary more than others
  // - Overall improvement trend over time
  // - Some gaps (missed check-ins)

  for (let i = daysToSeed - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Skip some days randomly (to show gaps in consistency)
    const skipChance = isWeekend ? 0.3 : 0.15; // 30% skip on weekends, 15% on weekdays
    if (Math.random() < skipChance) {
      continue; // Skip this day
    }

    // Calculate base effort with improvement over time
    const progressFactor = 1 + (daysToSeed - i) / daysToSeed * 0.5; // 0% to 50% improvement
    const weekendPenalty = isWeekend ? 0.7 : 1.0; // 30% reduction on weekends

    // Generate effort levels for each dimension with realistic patterns
    const dimensionEfforts = journey.dimensions.map((dim, idx) => {
      let baseEffort: number;
      
      // Different patterns for different dimensions
      switch (dim.name) {
        case 'Physical Exercise':
          // Varies a lot, lower on weekends
          baseEffort = (1 + Math.random() * 2) * weekendPenalty;
          break;
        case 'Mental Wellness':
          // More consistent
          baseEffort = 2 + Math.random();
          break;
        case 'Nutrition':
          // Good with occasional spikes
          baseEffort = 2.5 + Math.random() * 0.5;
          if (Math.random() < 0.1) baseEffort = 1; // Occasional bad day
          break;
        case 'Sleep Quality':
          // Consistent but slightly worse on weekends
          baseEffort = (2 + Math.random() * 0.5) * (isWeekend ? 0.9 : 1.0);
          break;
        case 'Social Connection':
          // Much higher on weekends!
          baseEffort = isWeekend ? 2.5 + Math.random() : 1 + Math.random();
          break;
        case 'Personal Growth':
          // Steady, slight improvement over time
          baseEffort = 1.5 + Math.random() * 0.5;
          break;
        default:
          baseEffort = 1 + Math.random() * 2;
      }

      // Apply progress factor
      const effort = Math.round(Math.min(4, baseEffort * progressFactor));
      
      // Calculate score using EFFORT_SCORE_MAP
      const effortScore = EFFORT_SCORE_MAP[effort];
      const score = dim.weight * effortScore;
      
      return {
        dimensionId: dim.id,
        effortLevel: effort,
        score: score
      };
    });

    // Calculate total score
    const totalScore = dimensionEfforts.reduce((sum, d) => sum + d.score, 0);

    // Create check-in
    await prisma.checkin.create({
      data: {
        userId: user.id,
        journeyId: journey.id,
        date: date,
        totalScore: totalScore,
        clientCheckinId: `seed-${journey.id}-${date.toISOString().split('T')[0]}-${Date.now()}`,
        details: {
          create: dimensionEfforts.map(d => ({
            dimensionId: d.dimensionId,
            effortLevel: d.effortLevel,
            score: d.score
          }))
        }
      }
    });

    const dateStr = date.toISOString().split('T')[0];
    console.log(`  ✓ ${dateStr} - Score: ${totalScore.toFixed(1)} ${isWeekend ? '(weekend)' : ''}`);
  }

  // Update streak for this journey
  const checkins = await prisma.checkin.findMany({
    where: {
      userId: user.id,
      journeyId: journey.id
    },
    orderBy: { date: 'desc' }
  });

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  // Sort by date ascending for streak calculation
  const sortedCheckins = [...checkins].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const checkin of sortedCheckins) {
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const daysDiff = Math.floor((checkin.date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = checkin.date;
  }

  // Check if streak is current (last check-in was yesterday or today)
  if (lastDate) {
    const daysSinceLastCheckin = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    currentStreak = daysSinceLastCheckin <= 1 ? tempStreak : 0;
  }

  // Create or update streak record
  await prisma.streak.upsert({
    where: {
      userId_journeyId: {
        userId: user.id,
        journeyId: journey.id
      }
    },
    create: {
      userId: user.id,
      journeyId: journey.id,
      currentStreak,
      longestStreak,
      lastCheckinDate: lastDate || today
    },
    update: {
      currentStreak,
      longestStreak,
      lastCheckinDate: lastDate || today
    }
  });

  console.log(`\n✅ Seeding complete!`);
  console.log(`\n📊 Summary:`);
  console.log(`  Journey: "${journey.title}"`);
  console.log(`  Journey ID: ${journey.id}`);
  console.log(`  Dimensions: ${journey.dimensions.length}`);
  console.log(`  Check-ins created: ${checkins.length}`);
  console.log(`  Current streak: ${currentStreak} days`);
  console.log(`  Longest streak: ${longestStreak} days`);
  console.log(`\n🎯 Next Steps:`);
  console.log(`  1. Go to http://localhost:5173`);
  console.log(`  2. Navigate to journey: "${journey.title}"`);
  console.log(`  3. Click "📊 Analytics" button`);
  console.log(`  4. Explore all the charts with real data!`);
  console.log(`\n🕸️ You should see:`);
  console.log(`  - Spider Chart: 6 dimensions with varying strengths`);
  console.log(`  - Line Chart: ~${checkins.length} data points showing improvement`);
  console.log(`  - Bar Chart: Daily breakdown across 6 dimensions`);
  console.log(`  - Heatmap: ${daysToSeed} days with some gaps`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

