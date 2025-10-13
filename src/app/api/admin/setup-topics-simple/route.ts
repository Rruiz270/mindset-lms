import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALL_TOPICS } from '@/data/topics';

// Simple topic setup without authentication for testing
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up topics in database (simple)...');

    // Clear existing topics first
    try {
      await prisma.topic.deleteMany({});
      console.log('🗑️ Cleared existing topics');
    } catch (clearError: any) {
      console.log('⚠️ No existing topics to clear:', clearError.message);
    }

    let createdCount = 0;
    const results = [];
    const errors = [];

    // Create topics in smaller batches
    const batchSize = 10;
    for (let i = 0; i < ALL_TOPICS.length; i += batchSize) {
      const batch = ALL_TOPICS.slice(i, i + batchSize);
      
      for (const topicData of batch) {
        try {
          const topic = await prisma.topic.create({
            data: {
              id: topicData.id,
              name: topicData.name,
              level: topicData.level,
              orderIndex: topicData.dayIndex,
              description: `${topicData.courseType} topic for ${topicData.level} level`,
              lessonPlan: `Lesson plan for ${topicData.name}`,
              objectives: topicData.objectives ? topicData.objectives : null,
              materials: topicData.materials ? topicData.materials : null,
            }
          });

          results.push({
            id: topic.id,
            name: topic.name,
            level: topic.level,
            status: 'created'
          });

          createdCount++;
          
        } catch (error: any) {
          console.error(`❌ Error creating topic ${topicData.name}:`, error.message);
          errors.push({
            id: topicData.id,
            name: topicData.name,
            level: topicData.level,
            error: error.message
          });
        }
      }
      
      console.log(`📚 Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(ALL_TOPICS.length/batchSize)}, created ${createdCount} topics so far...`);
    }

    console.log(`✅ Topic setup completed! Created ${createdCount}/${ALL_TOPICS.length} topics`);

    // Get summary by level
    const summary = {
      STARTER: results.filter(r => r.level === 'STARTER').length,
      SURVIVOR: results.filter(r => r.level === 'SURVIVOR').length,
      EXPLORER: results.filter(r => r.level === 'EXPLORER').length,
      EXPERT: results.filter(r => r.level === 'EXPERT').length,
    };

    return NextResponse.json({
      success: createdCount > 0,
      message: `Successfully created ${createdCount} topics for all levels`,
      summary,
      details: {
        total: ALL_TOPICS.length,
        created: createdCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors.slice(0, 5) : [], // Show first 5 errors
      note: 'Topics are now available for Smart Learning and Smart Conversation courses'
    });

  } catch (error: any) {
    console.error('💥 Topic setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup topics',
      details: error.message,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 });
  }
}

// Support GET for status check
export async function GET() {
  try {
    const topicCount = await prisma.topic.count();
    
    if (topicCount === 0) {
      return NextResponse.json({
        success: false,
        totalTopics: 0,
        message: 'No topics found. Run POST to create topics.',
        isSetup: false
      });
    }

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
      isSetup: topicCount > 0,
      expectedTotal: ALL_TOPICS.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}