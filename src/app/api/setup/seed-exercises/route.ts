import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Level, Phase, ExerciseCategory, ExerciseType } from '@prisma/client'

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

    console.log('Found topic:', topic.name)

    // Check if exercises already exist
    const existingExercises = await prisma.exercise.findMany({
      where: { topicId: topic.id }
    })

    if (existingExercises.length > 0) {
      return NextResponse.json({
        message: 'Exercises already exist for this topic',
        count: existingExercises.length
      })
    }

    // Pre-class exercises (3 per category)
    const preClassExercises = [
      // READING - Pre-class
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.READING,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Job Advertisement Reading",
        instructions: "Read the job advertisement and answer the questions.",
        content: {
          text: "WANTED: Sales Assistant - Full-time position available at Downtown Electronics Store. Requirements: High school diploma, friendly personality, basic computer skills. Experience preferred but not required. Excellent benefits package including health insurance and paid vacation. Starting salary: $15/hour. Apply in person Monday-Friday 9am-5pm.",
          questions: [
            {
              question: "What type of job is advertised?",
              options: ["Manager", "Sales Assistant", "Computer Technician", "Security Guard"],
              correct: 1
            }
          ]
        },
        correctAnswer: [1],
        points: 10,
        orderIndex: 1
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.READING,
        type: ExerciseType.TRUE_FALSE,
        title: "Job Requirements",
        instructions: "Read the statements and mark them as True or False.",
        content: {
          text: "For most entry-level jobs, employers look for candidates with a positive attitude, willingness to learn, and basic communication skills. A college degree is always required for entry-level positions.",
          questions: [
            {
              statement: "Employers value a positive attitude for entry-level jobs.",
              correct: true
            },
            {
              statement: "A college degree is always required for entry-level positions.",
              correct: false
            }
          ]
        },
        correctAnswer: [true, false],
        points: 10,
        orderIndex: 2
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.READING,
        type: ExerciseType.GAP_FILL,
        title: "Complete the Job Application",
        instructions: "Fill in the missing words in the job application form.",
        content: {
          text: "Please complete this application form:\nName: _____ _____\nAddress: _____ Street, City, State\nPhone: (_____) _____-_____\nPosition applying for: _____\nAvailable start date: _____",
          blanks: ["First", "Last", "123 Main", "555", "123", "4567", "Sales Assistant", "Immediately"]
        },
        correctAnswer: ["First", "Last", "123 Main", "555", "123", "4567", "Sales Assistant", "Immediately"],
        points: 10,
        orderIndex: 3
      },

      // WRITING - Pre-class
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.WRITING,
        type: ExerciseType.ESSAY,
        title: "Write a Cover Letter",
        instructions: "Write a short cover letter (50-100 words) for the Sales Assistant position.",
        content: {
          prompt: "You are applying for the Sales Assistant position at Downtown Electronics Store. Write a cover letter explaining why you are interested in the job and what skills you have.",
          wordLimit: 100
        },
        correctAnswer: null, // Teacher will grade
        points: 15,
        orderIndex: 4
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.WRITING,
        type: ExerciseType.SENTENCE_TRANSFORMATION,
        title: "Rewrite Job-Related Sentences",
        instructions: "Rewrite these sentences using the words in brackets.",
        content: {
          sentences: [
            {
              original: "I have experience in sales.",
              instruction: "Use 'worked'",
              example: "I have worked in sales before."
            },
            {
              original: "The job requires good communication.",
              instruction: "Use 'needs'",
              example: "The job needs good communication skills."
            }
          ]
        },
        correctAnswer: ["I have worked in sales before.", "The job needs good communication skills."],
        points: 10,
        orderIndex: 5
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.WRITING,
        type: ExerciseType.GAP_FILL,
        title: "Complete the Sentences",
        instructions: "Complete these job-related sentences with the correct words.",
        content: {
          sentences: [
            "I am _____ in working for your company.",
            "My _____ include customer service and teamwork.",
            "I am _____ to start work immediately."
          ]
        },
        correctAnswer: ["interested", "skills", "available"],
        points: 10,
        orderIndex: 6
      },

      // LISTENING - Pre-class
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.LISTENING,
        type: ExerciseType.AUDIO_QUIZ,
        title: "Job Interview Dialogue",
        instructions: "Listen to the job interview dialogue and answer the questions.",
        content: {
          audioUrl: "/audio/job-interview-basic.mp3", // Placeholder
          transcript: "Interviewer: Tell me about yourself.\nCandidate: I'm a recent graduate with strong communication skills.\nInterviewer: Why do you want this job?\nCandidate: I enjoy helping customers and I'm interested in electronics.",
          questions: [
            {
              question: "What does the candidate mention about their background?",
              options: ["Recent graduate", "Experienced worker", "Student", "Manager"],
              correct: 0
            }
          ]
        },
        correctAnswer: [0],
        points: 10,
        orderIndex: 7
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.LISTENING,
        type: ExerciseType.DICTATION,
        title: "Job Skills Dictation",
        instructions: "Listen and write down the job skills you hear.",
        content: {
          audioUrl: "/audio/job-skills.mp3", // Placeholder
          sentences: [
            "Communication skills are very important.",
            "Teamwork helps you work well with others.",
            "Problem-solving skills help you find solutions."
          ]
        },
        correctAnswer: [
          "Communication skills are very important.",
          "Teamwork helps you work well with others.",
          "Problem-solving skills help you find solutions."
        ],
        points: 15,
        orderIndex: 8
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.LISTENING,
        type: ExerciseType.NOTE_TAKING,
        title: "Job Requirements Notes",
        instructions: "Listen to the job description and take notes on the requirements.",
        content: {
          audioUrl: "/audio/job-requirements.mp3", // Placeholder
          keyPoints: [
            "High school diploma required",
            "Computer skills needed",
            "Customer service experience helpful",
            "Full-time position",
            "Benefits included"
          ]
        },
        correctAnswer: [
          "High school diploma required",
          "Computer skills needed", 
          "Customer service experience helpful",
          "Full-time position",
          "Benefits included"
        ],
        points: 15,
        orderIndex: 9
      },

      // SPEAKING - Pre-class
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.SPEAKING,
        type: ExerciseType.AUDIO_RECORDING,
        title: "Self Introduction",
        instructions: "Record yourself introducing yourself for a job interview (1-2 minutes).",
        content: {
          prompts: [
            "Tell me about yourself",
            "Why are you interested in this position?",
            "What are your strongest skills?"
          ],
          timeLimit: 120 // seconds
        },
        correctAnswer: null, // Teacher will evaluate
        points: 20,
        orderIndex: 10
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.SPEAKING,
        type: ExerciseType.PRONUNCIATION,
        title: "Job-Related Pronunciation",
        instructions: "Practice pronouncing these job-related words correctly.",
        content: {
          words: [
            { word: "application", phonetic: "/ˌæplɪˈkeɪʃən/" },
            { word: "interview", phonetic: "/ˈɪntərvjuː/" },
            { word: "experience", phonetic: "/ɪkˈspɪəriəns/" },
            { word: "qualification", phonetic: "/ˌkwɒlɪfɪˈkeɪʃən/" },
            { word: "responsibility", phonetic: "/rɪˌspɒnsəˈbɪləti/" }
          ]
        },
        correctAnswer: null, // Pronunciation will be checked by speech recognition
        points: 15,
        orderIndex: 11
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.SPEAKING,
        type: ExerciseType.AUDIO_RECORDING,
        title: "Role Play - Job Inquiry",
        instructions: "Record yourself calling to ask about a job opening. Use the prompts provided.",
        content: {
          scenario: "You are calling Downtown Electronics Store to ask about the Sales Assistant position.",
          phrases: [
            "Hello, I'm calling about the Sales Assistant position.",
            "Could you tell me more about the job requirements?",
            "When would be a good time to come in and apply?",
            "Thank you for your time."
          ]
        },
        correctAnswer: null,
        points: 20,
        orderIndex: 12
      },

      // GRAMMAR - Pre-class  
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.GRAMMAR,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Present Perfect for Experience",
        instructions: "Choose the correct form of the verb to talk about job experience.",
        content: {
          questions: [
            {
              sentence: "I _____ in retail for three years.",
              options: ["work", "worked", "have worked", "am working"],
              correct: 2
            },
            {
              sentence: "She _____ never _____ in an office before.",
              options: ["has/work", "have/worked", "has/worked", "is/working"], 
              correct: 2
            }
          ]
        },
        correctAnswer: [2, 2],
        points: 10,
        orderIndex: 13
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.GRAMMAR,
        type: ExerciseType.ERROR_CORRECTION,
        title: "Fix the Job Application Errors",
        instructions: "Find and correct the grammar mistakes in these sentences.",
        content: {
          sentences: [
            "I am very interested for this position.",
            "I have experience to work with customers.",
            "My skills includes communication and teamwork.",
            "I can starts work immediately."
          ]
        },
        correctAnswer: [
          "I am very interested in this position.",
          "I have experience working with customers.",
          "My skills include communication and teamwork.", 
          "I can start work immediately."
        ],
        points: 15,
        orderIndex: 14
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.GRAMMAR,
        type: ExerciseType.GAP_FILL,
        title: "Modal Verbs for Ability",
        instructions: "Complete the sentences with can, could, or be able to.",
        content: {
          sentences: [
            "I _____ speak English and Spanish.",
            "_____ you work weekends?",
            "She will _____ to start next month.",
            "I _____ use computers very well."
          ]
        },
        correctAnswer: ["can", "Can", "be able", "can"],
        points: 10,
        orderIndex: 15
      },

      // VOCABULARY - Pre-class
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.VOCABULARY,
        type: ExerciseType.MATCHING,
        title: "Job-Related Vocabulary Matching",
        instructions: "Match the job terms with their definitions.",
        content: {
          terms: [
            "Resume",
            "Interview", 
            "Salary",
            "Benefits",
            "Qualification"
          ],
          definitions: [
            "A formal meeting to evaluate a job candidate",
            "Skills and education needed for a job",
            "Extra rewards like health insurance",
            "Money paid for work",
            "Document listing your work experience"
          ],
          correctMatches: [4, 0, 3, 2, 1] // Resume->4, Interview->0, etc.
        },
        correctAnswer: [4, 0, 3, 2, 1],
        points: 10,
        orderIndex: 16
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.VOCABULARY,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: "Choose the Right Job Word",
        instructions: "Select the best word to complete each sentence.",
        content: {
          questions: [
            {
              sentence: "I need to _____ for this job online.",
              options: ["apply", "work", "study", "pay"],
              correct: 0
            },
            {
              sentence: "The _____ for this position is $15 per hour.",
              options: ["time", "wage", "age", "place"],
              correct: 1
            }
          ]
        },
        correctAnswer: [0, 1],
        points: 10,
        orderIndex: 17
      },
      {
        topicId: topic.id,
        phase: Phase.PRE_CLASS,
        category: ExerciseCategory.VOCABULARY,
        type: ExerciseType.GAP_FILL,
        title: "Complete with Job Vocabulary",
        instructions: "Fill in the blanks with appropriate job-related words.",
        content: {
          wordBank: ["employer", "employee", "workplace", "schedule", "overtime"],
          sentences: [
            "The _____ hired five new people last month.",
            "Each _____ must follow the company rules.",
            "Our _____ is very modern and comfortable.",
            "I work _____ on busy days."
          ]
        },
        correctAnswer: ["employer", "employee", "workplace", "overtime"],
        points: 10,
        orderIndex: 18
      }
    ]

    // Create all pre-class exercises
    console.log('Creating pre-class exercises...')
    for (const exercise of preClassExercises) {
      await prisma.exercise.create({ data: exercise })
    }

    console.log('Pre-class exercises created successfully!')

    return NextResponse.json({
      message: 'Exercises created successfully for "Work: Getting a Job"',
      topic: topic.name,
      preClassExercises: preClassExercises.length,
      totalExercises: preClassExercises.length
    })

  } catch (error) {
    console.error('Exercise seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed exercises', details: error.message },
      { status: 500 }
    )
  }
}