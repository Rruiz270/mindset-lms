import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if topics already exist
    const topicCount = await prisma.topic.count()
    
    if (topicCount > 0) {
      return NextResponse.json({ 
        message: 'Topics already exist', 
        count: topicCount 
      })
    }

    // Seed starter topics
    const starterTopics = [
      { name: "Travel: Things to Do", orderIndex: 1 },
      { name: "Travel: Going Places", orderIndex: 2 },
      { name: "Travel: Things to Take", orderIndex: 3 },
      { name: "Describing People: Appearance", orderIndex: 4 },
      { name: "Describing People: Personality", orderIndex: 5 },
      { name: "Describing People: Feelings", orderIndex: 6 },
      { name: "Entertainment: TV", orderIndex: 7 },
      { name: "Entertainment: Movies", orderIndex: 8 },
      { name: "About Me: Getting to Know You", orderIndex: 9 },
      { name: "About Me: Where Are You From?", orderIndex: 10 },
      { name: "About Me: This Is My Family", orderIndex: 11 },
      { name: "School: In the Classroom", orderIndex: 12 },
      { name: "School: At School", orderIndex: 13 },
      { name: "Time: My Day", orderIndex: 14 },
      { name: "Time: My Week", orderIndex: 15 },
      { name: "Time: My Month", orderIndex: 16 },
      { name: "Shopping: How Much Is It?", orderIndex: 17 },
      { name: "Shopping: Shopping for Clothes", orderIndex: 18 },
      { name: "Food: At the Supermarket", orderIndex: 19 },
      { name: "Food: At a Restaurant", orderIndex: 20 },
      { name: "Food: Food I Like", orderIndex: 21 },
      { name: "Health: Making an Appointment", orderIndex: 22 },
      { name: "Health: At the Doctor", orderIndex: 23 },
      { name: "Community: Finding an Apartment", orderIndex: 24 },
      { name: "Community: Around Town", orderIndex: 25 },
      { name: "Work: Jobs", orderIndex: 26 },
      { name: "Work: Getting a Job", orderIndex: 27 },
      { name: "Work: Getting to Work", orderIndex: 28 },
      { name: "Work: Calling in Sick", orderIndex: 29 },
      { name: "Free Time: Free-time Activities", orderIndex: 30 },
      { name: "Free Time: Sports", orderIndex: 31 },
      { name: "Free Time: Let's Go!", orderIndex: 32 }
    ]

    // Create all starter topics
    for (const topic of starterTopics) {
      await prisma.topic.create({
        data: {
          ...topic,
          level: 'STARTER',
          description: `Learn essential vocabulary and phrases for ${topic.name.toLowerCase()}`
        }
      })
    }

    // Also create a few topics for other levels for testing
    const otherLevelTopics = [
      { name: "Daily Routines and Habits", level: 'SURVIVOR', orderIndex: 1 },
      { name: "Past Experiences", level: 'SURVIVOR', orderIndex: 2 },
      { name: "Business Communication", level: 'EXPLORER', orderIndex: 1 },
      { name: "Environmental Issues", level: 'EXPLORER', orderIndex: 2 },
      { name: "Advanced Debate Skills", level: 'EXPERT', orderIndex: 1 },
      { name: "Academic Writing", level: 'EXPERT', orderIndex: 2 }
    ]

    for (const topic of otherLevelTopics) {
      await prisma.topic.create({
        data: {
          name: topic.name,
          level: topic.level as any,
          orderIndex: topic.orderIndex,
          description: `Advanced content for ${topic.name}`
        }
      })
    }

    const newTopicCount = await prisma.topic.count()

    return NextResponse.json({ 
      success: true, 
      message: 'Topics created successfully',
      count: newTopicCount 
    })
  } catch (error) {
    console.error('Error setting up topics:', error)
    return NextResponse.json(
      { error: 'Failed to setup topics' },
      { status: 500 }
    )
  }
}