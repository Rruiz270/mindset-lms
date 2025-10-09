import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🚀 Starting database setup...')
    
    // First, let's test the connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if data already exists
    const existingTopics = await prisma.topic.count()
    if (existingTopics > 0) {
      return NextResponse.json({ 
        message: 'Database already initialized', 
        topicsCount: existingTopics 
      })
    }
    
    console.log('📚 Creating topics and content...')
    
    // Create the 32 Starter Level Topics
    const STARTER_TOPICS = [
      { name: "Shopping: How Much Is It?", category: "Shopping & Money", grammarFocus: "Numbers, Prices, 'How much?'" },
      { name: "Food: What's for Lunch?", category: "Food & Drinks", grammarFocus: "Food vocabulary, 'I like/don't like'" },
      { name: "Health: How Are You Feeling?", category: "Health & Body", grammarFocus: "Body parts, 'I feel...', Present tense" },
      { name: "People: Meet My Family", category: "People & Relationships", grammarFocus: "Family members, Possessive pronouns" },
      { name: "Work: What Do You Do?", category: "Work & Jobs", grammarFocus: "Job titles, 'I work as...'" },
      { name: "Community: Around the Neighborhood", category: "Community & Places", grammarFocus: "Places in town, Prepositions of place" },
      { name: "Leisure: Free Time Activities", category: "Leisure & Entertainment", grammarFocus: "Hobbies, 'I like to...'" },
      { name: "Travel: Getting Around", category: "Travel & Transportation", grammarFocus: "Transport methods, Directions" },
      { name: "School: At the Classroom", category: "Education & Learning", grammarFocus: "School supplies, 'There is/are'" },
      { name: "Time: What Time Is It?", category: "Time & Schedule", grammarFocus: "Telling time, Daily routine" },
      { name: "Weather: What's It Like Today?", category: "Weather & Seasons", grammarFocus: "Weather vocabulary, 'It's...'" },
      { name: "Clothing: What Are You Wearing?", category: "Clothing & Style", grammarFocus: "Clothing items, Colors, 'I'm wearing...'" },
      { name: "Home: My House", category: "Home & Living", grammarFocus: "Rooms, Furniture, 'There is/are'" },
      { name: "Emotions: How Do You Feel?", category: "Emotions & Feelings", grammarFocus: "Emotion words, 'I feel...'" },
      { name: "Hobbies: What Do You Like?", category: "Hobbies & Interests", grammarFocus: "Activity verbs, 'I enjoy...'" },
      { name: "Technology: Using Devices", category: "Technology & Digital", grammarFocus: "Tech vocabulary, 'I use...'" },
      { name: "Sports: Let's Play!", category: "Sports & Fitness", grammarFocus: "Sports names, 'I play...'" },
      { name: "Animals: Pets and Wildlife", category: "Animals & Nature", grammarFocus: "Animal names, 'I have...'" },
      { name: "Colors and Shapes", category: "Description & Appearance", grammarFocus: "Colors, Shapes, 'It's...'" },
      { name: "Numbers and Counting", category: "Numbers & Math", grammarFocus: "Cardinal numbers, 'How many?'" },
      { name: "Greetings: Nice to Meet You", category: "Social Interaction", grammarFocus: "Greetings, Introductions" },
      { name: "Directions: Where Is It?", category: "Location & Navigation", grammarFocus: "Direction words, 'Where is...?'" },
      { name: "Restaurants: Ordering Food", category: "Food & Dining", grammarFocus: "Menu items, 'I'd like...'" },
      { name: "Shopping: At the Store", category: "Shopping & Services", grammarFocus: "Store types, 'I need...'" },
      { name: "Transportation: Getting There", category: "Travel & Movement", grammarFocus: "Vehicles, 'I go by...'" },
      { name: "Daily Routine: My Day", category: "Daily Life", grammarFocus: "Time expressions, Present simple" },
      { name: "Celebrations: Special Days", category: "Culture & Holidays", grammarFocus: "Holiday vocabulary, 'We celebrate...'" },
      { name: "Communication: Phone and Email", category: "Communication", grammarFocus: "Contact methods, 'Can I...?'" },
      { name: "Nature: Plants and Environment", category: "Environment & Nature", grammarFocus: "Nature words, 'I see...'" },
      { name: "Music and Arts", category: "Arts & Culture", grammarFocus: "Art vocabulary, 'I listen to...'" },
      { name: "Safety: Staying Safe", category: "Safety & Health", grammarFocus: "Safety rules, 'You should...'" },
      { name: "Problem Solving: Getting Help", category: "Problem Solving", grammarFocus: "Help expressions, 'Can you help...?'" }
    ]
    
    // Create topics with exercises and slides
    for (let i = 0; i < STARTER_TOPICS.length; i++) {
      const topicData = STARTER_TOPICS[i]
      
      const topic = await prisma.topic.create({
        data: {
          name: topicData.name,
          level: 'STARTER',
          orderIndex: i + 1,
          category: topicData.category,
          grammarFocus: topicData.grammarFocus,
          isActive: true
        }
      })
      
      // Create pre-class exercises
      const exerciseTypes = ['VOCABULARY', 'LISTENING', 'GRAMMAR', 'READING']
      for (const type of exerciseTypes) {
        await prisma.exercise.create({
          data: {
            title: `${type.toLowerCase()} Exercise - ${topicData.name}`,
            instructions: `Complete this ${type.toLowerCase()} exercise before your live class.`,
            type: 'MULTIPLE_CHOICE',
            category: type,
            phase: 'PRE_CLASS',
            content: {
              question: `${type} practice for ${topicData.name}`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0
            },
            points: 10,
            topicId: topic.id
          }
        })
      }
      
      // Create live class slides (5 slides)
      const slideTypes = [
        { title: 'Welcome & Warm-up', type: 'intro' },
        { title: 'Vocabulary Focus', type: 'vocabulary' },
        { title: 'Grammar Practice', type: 'grammar' },
        { title: 'Communication Activity', type: 'communication' },
        { title: 'Review & Homework', type: 'review' }
      ]
      
      for (let j = 0; j < slideTypes.length; j++) {
        await prisma.slide.create({
          data: {
            slideNumber: j + 1,
            title: slideTypes[j].title,
            content: {
              type: slideTypes[j].type,
              objective: `Learn ${topicData.grammarFocus}`,
              vocabulary: `Key words for ${topicData.name}`,
              grammar: topicData.grammarFocus,
              examples: [`Example 1 for ${topicData.name}`, `Example 2 for ${topicData.name}`],
              practice: `Practice activity for ${topicData.name}`,
              summary: `Summary of ${topicData.name}`,
              homework: `Complete post-class exercises for ${topicData.name}`
            },
            notes: `Teacher notes for ${slideTypes[j].title}`,
            topicId: topic.id
          }
        })
      }
      
      // Create post-class exercises
      await prisma.exercise.create({
        data: {
          title: `Homework - ${topicData.name}`,
          instructions: `Complete this homework assignment after your live class.`,
          type: 'ESSAY',
          category: 'WRITING',
          phase: 'POST_CLASS',
          content: {
            prompt: `Write about what you learned in ${topicData.name}`,
            minWords: 50
          },
          points: 15,
          topicId: topic.id
        }
      })
      
      console.log(`✅ Created topic ${i + 1}/32: ${topicData.name}`)
    }
    
    // Create a demo student user
    const demoStudent = await prisma.user.create({
      data: {
        email: 'carlos@mindset.com',
        password: 'student123', // In production, this should be hashed
        name: 'Carlos Oliveira',
        role: 'STUDENT',
        level: 'STARTER'
      }
    })
    
    // Create a package for the demo student
    await prisma.package.create({
      data: {
        name: 'Starter Package',
        totalLessons: 80,
        usedLessons: 0,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActive: true,
        studentId: demoStudent.id
      }
    })
    
    console.log('✅ Created demo student: carlos@mindset.com')
    
    // Get final counts
    const topicsCount = await prisma.topic.count()
    const exercisesCount = await prisma.exercise.count()
    const slidesCount = await prisma.slide.count()
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      data: {
        topics: topicsCount,
        exercises: exercisesCount,
        slides: slidesCount,
        demoUser: 'carlos@mindset.com (password: student123)'
      }
    })
    
  } catch (error) {
    console.error('❌ Database setup error:', error)
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}