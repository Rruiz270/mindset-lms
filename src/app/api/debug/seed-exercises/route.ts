import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Level, Phase, ExerciseCategory, ExerciseType } from '@prisma/client'

// Public seeding endpoint (temporary for setup)
export async function POST(request: NextRequest) {
  try {
    console.log('Starting exercise seeding...')

    // Get the first STARTER topic "Work: Getting a Job"
    const topic = await prisma.topic.findFirst({
      where: {
        level: Level.STARTER,
        name: "Work: Getting a Job"
      }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic "Work: Getting a Job" not found' },
        { status: 404 }
      )
    }

    console.log('Found topic:', topic.name, 'ID:', topic.id)

    // Check if exercises already exist
    const existingExercises = await prisma.exercise.count({
      where: { topicId: topic.id }
    })

    if (existingExercises > 0) {
      return NextResponse.json({
        message: 'Exercises already exist for this topic',
        topicName: topic.name,
        existingCount: existingExercises
      })
    }

    // Pre-class exercises - simplified set for testing
    const exercises = [
      // READING exercises
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.READING,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Job Advertisement Reading",
        instructions: "Read the job advertisement and answer the question.",
        content: {
          text: "WANTED: Sales Assistant - Full-time position at Downtown Electronics Store. Requirements: High school diploma, friendly personality, basic computer skills. Starting salary: $15/hour.",
          question: "What type of job is advertised?",
          options: ["Manager", "Sales Assistant", "Computer Technician", "Security Guard"]
        },
        correctAnswer: 1,
        points: 10,
        orderIndex: 1
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.READING,
        type: ExerciseType.TRUE_FALSE,
        title: "Job Requirements",
        instructions: "Read the statement and mark it as True or False.",
        content: {
          statement: "Employers value a positive attitude for entry-level jobs."
        },
        correctAnswer: true,
        points: 10,
        orderIndex: 2
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.READING,
        type: ExerciseType.GAP_FILL,
        title: "Complete the Sentence",
        instructions: "Fill in the missing word.",
        content: {
          sentence: "I am very _____ in this job position.",
          options: ["interested", "boring", "tired", "angry"]
        },
        correctAnswer: "interested",
        points: 10,
        orderIndex: 3
      },

      // WRITING exercises  
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.WRITING,
        type: ExerciseType.ESSAY,
        title: "Write a Cover Letter",
        instructions: "Write a short cover letter (50 words) for the Sales Assistant position.",
        content: {
          prompt: "You are applying for the Sales Assistant position. Write a cover letter explaining why you want the job."
        },
        correctAnswer: null,
        points: 15,
        orderIndex: 4
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.WRITING,
        type: ExerciseType.GAP_FILL,
        title: "Complete the Job Application",
        instructions: "Fill in the missing word.",
        content: {
          sentence: "My _____ include customer service and teamwork.",
          hint: "What do you have that helps you do the job?"
        },
        correctAnswer: "skills",
        points: 10,
        orderIndex: 5
      },

      // GRAMMAR exercises
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.GRAMMAR,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Present Perfect for Experience",
        instructions: "Choose the correct form.",
        content: {
          sentence: "I _____ in retail for three years.",
          options: ["work", "worked", "have worked", "am working"]
        },
        correctAnswer: 2,
        points: 10,
        orderIndex: 6
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.GRAMMAR,
        type: ExerciseType.GAP_FILL,
        title: "Modal Verbs",
        instructions: "Complete with can, could, or able.",
        content: {
          sentence: "I _____ speak English and Spanish."
        },
        correctAnswer: "can",
        points: 10,
        orderIndex: 7
      },

      // VOCABULARY exercises
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.VOCABULARY,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Job Vocabulary",
        instructions: "Choose the best word.",
        content: {
          sentence: "I need to _____ for this job online.",
          options: ["apply", "work", "study", "pay"]
        },
        correctAnswer: 0,
        points: 10,
        orderIndex: 8
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.VOCABULARY,
        type: ExerciseType.GAP_FILL,
        title: "Complete with Job Words",
        instructions: "Fill in the blank with a job-related word.",
        content: {
          sentence: "The _____ hired five new people last month.",
          hint: "Person who gives jobs to workers"
        },
        correctAnswer: "employer",
        points: 10,
        orderIndex: 9
      },

      // LISTENING exercises (simplified)
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.LISTENING,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Job Interview Question",
        instructions: "Listen to this common interview question and choose the best answer.",
        content: {
          question: "Tell me about yourself.",
          options: [
            "I'm a recent graduate with strong communication skills.",
            "I don't know what to say.",
            "I hate working.",
            "I'm very tired today."
          ]
        },
        correctAnswer: 0,
        points: 10,
        orderIndex: 10
      },

      // SPEAKING exercises (simplified)
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.SPEAKING,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Best Response",
        instructions: "What's the best way to introduce yourself in an interview?",
        content: {
          question: "How should you start an interview introduction?",
          options: [
            "Hello, my name is... and I'm excited about this opportunity.",
            "Hi, whatever.",
            "I don't want to be here.",
            "This job looks boring."
          ]
        },
        correctAnswer: 0,
        points: 10,
        orderIndex: 11
      }
    ]

    console.log('Creating', exercises.length, 'exercises...')

    // Create all exercises
    let createdCount = 0
    for (const exercise of exercises) {
      try {
        await prisma.exercise.create({ data: exercise })
        createdCount++
        console.log(`Created exercise ${createdCount}: ${exercise.title}`)
      } catch (error) {
        console.error(`Error creating exercise ${exercise.title}:`, error)
      }
    }

    console.log('Exercise seeding completed!')

    return NextResponse.json({
      success: true,
      message: 'Exercises created successfully!',
      topic: topic.name,
      topicId: topic.id,
      exercisesCreated: createdCount,
      breakdown: {
        READING: exercises.filter(e => e.category === ExerciseCategory.READING).length,
        WRITING: exercises.filter(e => e.category === ExerciseCategory.WRITING).length,
        GRAMMAR: exercises.filter(e => e.category === ExerciseCategory.GRAMMAR).length,
        VOCABULARY: exercises.filter(e => e.category === ExerciseCategory.VOCABULARY).length,
        LISTENING: exercises.filter(e => e.category === ExerciseCategory.LISTENING).length,
        SPEAKING: exercises.filter(e => e.category === ExerciseCategory.SPEAKING).length,
      }
    })

  } catch (error) {
    console.error('Exercise seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed exercises', details: error.message },
      { status: 500 }
    )
  }
}