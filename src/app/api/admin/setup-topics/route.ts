import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ALL_TOPICS } from '@/data/topics';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Setting up topics in database...');

    // Clear existing topics
    await prisma.topic.deleteMany({});
    console.log('🗑️ Cleared existing topics');

    let createdCount = 0;
    const results = [];

    // Create all topics
    for (const topicData of ALL_TOPICS) {
      try {
        const topic = await prisma.topic.create({
          data: {
            id: topicData.id,
            name: topicData.name,
            level: topicData.level,
            orderIndex: topicData.dayIndex,
            description: topicData.description || `${topicData.courseType} topic for ${topicData.level} level`,
            objectives: topicData.objectives ? JSON.stringify(topicData.objectives) : null,
            materials: topicData.materials ? JSON.stringify(topicData.materials) : null,
          }
        });

        results.push({
          id: topic.id,
          name: topic.name,
          level: topic.level,
          status: 'created'
        });

        createdCount++;
        
        if (createdCount % 10 === 0) {
          console.log(`📚 Created ${createdCount} topics...`);
        }
      } catch (error: any) {
        console.error(`❌ Error creating topic ${topicData.name}:`, error.message);
        results.push({
          id: topicData.id,
          name: topicData.name,
          level: topicData.level,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`✅ Topic setup completed! Created ${createdCount} topics`);

    // Get summary by level
    const summary = {
      STARTER: results.filter(r => r.level === 'STARTER' && r.status === 'created').length,
      SURVIVOR: results.filter(r => r.level === 'SURVIVOR' && r.status === 'created').length,
      EXPLORER: results.filter(r => r.level === 'EXPLORER' && r.status === 'created').length,
      EXPERT: results.filter(r => r.level === 'EXPERT' && r.status === 'created').length,
    };

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCount} topics for all levels`,
      summary,
      details: {
        total: ALL_TOPICS.length,
        created: createdCount,
        errors: results.filter(r => r.status === 'error').length
      },
      topics: results,
      note: 'Topics are now available for Smart Learning and Smart Conversation courses'
    });

  } catch (error: any) {
    console.error('💥 Topic setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup topics',
      details: error.message
    }, { status: 500 });
  }
}

// Also support GET for status check
export async function GET() {
  try {
    const topicCount = await prisma.topic.count();
    const topicsByLevel = await prisma.topic.groupBy({
      by: ['level'],
      _count: true
    });

    return NextResponse.json({
      success: true,
      totalTopics: topicCount,
      byLevel: topicsByLevel.reduce((acc, item) => {
        acc[item.level] = item._count;
        return acc;
      }, {} as Record<string, number>),
      isSetup: topicCount > 0
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}