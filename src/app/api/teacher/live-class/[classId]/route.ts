import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get booking and topic information
    const booking = await prisma.$queryRaw`
      SELECT 
        b.id,
        b."scheduledAt" as date,
        TO_CHAR(b."scheduledAt", 'HH24:MI') as time,
        u.name as "studentName",
        t.id as "topicId",
        t.name as "topicName",
        t."orderIndex" as "topicOrderIndex",
        t.description as "topicDescription",
        t."lessonPlan",
        t.objectives,
        t.materials
      FROM "Booking" b
      JOIN "User" u ON b."studentId" = u.id
      JOIN "Topic" t ON b."topicId" = t.id
      WHERE b.id = ${params.classId}
      AND b."teacherId" = ${session.user.id}
    ` as any[]

    if (booking.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const classData = booking[0]

    // Get live class content from database
    const liveClassContent = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.type,
        c.duration,
        c."order",
        c."resourceUrl"
      FROM "Content" c
      WHERE c."topicId" = ${classData.topicId}
      AND c.phase = 'live_class'
      ORDER BY c."order"
    ` as any[]

    // Get slides for the live class
    const slides = await prisma.$queryRaw`
      SELECT 
        s.id,
        s."slideNumber",
        s.title,
        s.type,
        s.content,
        s.notes,
        s."order"
      FROM "Slide" s
      WHERE s."topicId" = ${classData.topicId}
      ORDER BY s."slideNumber"
    ` as any[]

    // Get exercises that can be used in live class
    const exercises = await prisma.$queryRaw`
      SELECT 
        e.id,
        e.category,
        e.type,
        e.title,
        e.instructions,
        e.content,
        e.points,
        e."orderIndex"
      FROM "Exercise" e
      WHERE e."topicId" = ${classData.topicId}
      AND e.phase = 'PRE_CLASS'
      ORDER BY e."orderIndex"
    ` as any[]

    // Format activities from content
    let activities = liveClassContent.map((content: any) => ({
      id: content.id,
      title: content.title,
      description: content.description,
      type: content.type,
      duration: content.duration,
      order: content.order,
      resourceUrl: content.resourceUrl
    }))

    // If no content exists, provide default structure
    if (activities.length === 0) {
      activities = [
        {
          id: 'default-1',
          title: 'Warm-up & Introduction',
          description: 'Welcome students, review previous lesson, introduce today\'s topic',
          type: 'discussion',
          duration: 10,
          order: 1,
          resourceUrl: null
        },
        {
          id: 'default-2',
          title: 'Main Content Presentation',
          description: 'Present the core lesson material using slides and interactive activities',
          type: 'teaching',
          duration: 25,
          order: 2,
          resourceUrl: null
        },
        {
          id: 'default-3',
          title: 'Practice Activities',
          description: 'Student practice with exercises, role-plays, or group activities',
          type: 'exercise',
          duration: 20,
          order: 3,
          resourceUrl: null
        },
        {
          id: 'default-4',
          title: 'Wrap-up & Homework Assignment',
          description: 'Review key points, assign homework, preview next lesson',
          type: 'review',
          duration: 5,
          order: 4,
          resourceUrl: null
        }
      ]
    }

    return NextResponse.json({
      id: classData.id,
      date: classData.date,
      time: classData.time,
      studentName: classData.studentName,
      topicName: classData.topicName,
      topicOrderIndex: classData.topicOrderIndex,
      topicDescription: classData.topicDescription,
      lessonPlan: classData.lessonPlan,
      objectives: classData.objectives,
      materials: classData.materials,
      activities,
      slides,
      exercises,
      hasContent: liveClassContent.length > 0,
      contentCount: {
        activities: activities.length,
        slides: slides.length,
        exercises: exercises.length
      }
    })

  } catch (error: any) {
    console.error('Error fetching class info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class info', details: error.message },
      { status: 500 }
    )
  }
}