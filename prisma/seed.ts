import { PrismaClient, Level, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Topics extracted from the screenshots
const topicsData = {
  [Level.STARTER]: [
    { name: "Work: Getting a Job", orderIndex: 1 },
    { name: "Work: Getting to Work", orderIndex: 2 },
    { name: "Work: Calling in Sick", orderIndex: 3 },
    { name: "Free Time: Free-time Activities", orderIndex: 4 },
    { name: "Free Time: Sports", orderIndex: 5 },
    { name: "Free Time: Let's Go!", orderIndex: 6 },
    { name: "Travel: Things to Do", orderIndex: 7 },
    { name: "Travel: Going Places", orderIndex: 8 },
    { name: "Travel: Things to Take", orderIndex: 9 },
    { name: "Describing People: Appearance", orderIndex: 10 },
    { name: "Describing People: Personality", orderIndex: 11 },
    { name: "Describing People: Feelings", orderIndex: 12 },
    // Add more topics up to 40
    { name: "Food & Drink: At the Restaurant", orderIndex: 13 },
    { name: "Food & Drink: Cooking at Home", orderIndex: 14 },
    { name: "Shopping: At the Store", orderIndex: 15 },
    { name: "Shopping: Online Shopping", orderIndex: 16 },
    { name: "Health: Feeling Sick", orderIndex: 17 },
    { name: "Health: At the Doctor", orderIndex: 18 },
    { name: "Family: Family Members", orderIndex: 19 },
    { name: "Family: Family Activities", orderIndex: 20 },
    { name: "Home: Around the House", orderIndex: 21 },
    { name: "Home: Household Chores", orderIndex: 22 },
    { name: "Education: At School", orderIndex: 23 },
    { name: "Education: Study Habits", orderIndex: 24 },
    { name: "Technology: Using Devices", orderIndex: 25 },
    { name: "Technology: Social Media", orderIndex: 26 },
    { name: "Weather: Weather Conditions", orderIndex: 27 },
    { name: "Weather: Seasonal Activities", orderIndex: 28 },
    { name: "Transportation: Getting Around", orderIndex: 29 },
    { name: "Transportation: Public Transport", orderIndex: 30 },
    { name: "Entertainment: Movies & TV", orderIndex: 31 },
    { name: "Entertainment: Music & Concerts", orderIndex: 32 },
    { name: "Money: Banking", orderIndex: 33 },
    { name: "Money: Budgeting", orderIndex: 34 },
    { name: "Communication: Phone Calls", orderIndex: 35 },
    { name: "Communication: Emails", orderIndex: 36 },
    { name: "Emergencies: Asking for Help", orderIndex: 37 },
    { name: "Emergencies: Safety First", orderIndex: 38 },
    { name: "Culture: Holidays", orderIndex: 39 },
    { name: "Culture: Traditions", orderIndex: 40 },
  ],
  [Level.SURVIVOR]: [
    { name: "Teacher of the Year", orderIndex: 1 },
    { name: "On the Job", orderIndex: 2 },
    { name: "Living a Healthy Life", orderIndex: 3 },
    { name: "Are You a Bookworm?", orderIndex: 4 },
    { name: "Unusual Hobbies", orderIndex: 5 },
    { name: "Houses and Homes", orderIndex: 6 },
    { name: "Robots", orderIndex: 7 },
    { name: "What's for Breakfast?", orderIndex: 8 },
    { name: "Emojis", orderIndex: 9 },
    { name: "Birth Order", orderIndex: 10 },
    { name: "When I'm 64", orderIndex: 11 },
    { name: "Money, Money, Money", orderIndex: 12 },
    { name: "Getting the Picture", orderIndex: 13 },
    { name: "The Future of Farming", orderIndex: 14 },
    { name: "Faster, Higher, Stronger", orderIndex: 15 },
    { name: "The Power of Art", orderIndex: 16 },
    { name: "A Helping Hand", orderIndex: 17 },
    { name: "Reuse It!", orderIndex: 18 },
    // Continue with more topics
    { name: "Digital Detox", orderIndex: 19 },
    { name: "Extreme Sports", orderIndex: 20 },
    { name: "Food Waste", orderIndex: 21 },
    { name: "Green Living", orderIndex: 22 },
    { name: "Work-Life Balance", orderIndex: 23 },
    { name: "Social Networks", orderIndex: 24 },
    { name: "Street Art", orderIndex: 25 },
    { name: "Volunteer Work", orderIndex: 26 },
    { name: "Fashion Trends", orderIndex: 27 },
    { name: "Music Festivals", orderIndex: 28 },
    { name: "Pet Therapy", orderIndex: 29 },
    { name: "Smart Cities", orderIndex: 30 },
    { name: "Mindfulness", orderIndex: 31 },
    { name: "Career Changes", orderIndex: 32 },
    { name: "Online Learning", orderIndex: 33 },
    { name: "Cultural Differences", orderIndex: 34 },
    { name: "Space Tourism", orderIndex: 35 },
    { name: "Renewable Energy", orderIndex: 36 },
    { name: "Food Traditions", orderIndex: 37 },
    { name: "Urban Gardening", orderIndex: 38 },
    { name: "Digital Privacy", orderIndex: 39 },
    { name: "Life Goals", orderIndex: 40 },
  ],
  [Level.EXPLORER]: [
    { name: "Yes, We Can!", orderIndex: 1 },
    { name: "You Are What You Eat", orderIndex: 2 },
    { name: "Let's Take a Selfie!", orderIndex: 3 },
    { name: "Love Your Job!", orderIndex: 4 },
    { name: "Talk It Out", orderIndex: 5 },
    { name: "Stress and Relaxation", orderIndex: 6 },
    { name: "Addicted to Smartphones", orderIndex: 7 },
    { name: "Staycations", orderIndex: 8 },
    { name: "Town or Country?", orderIndex: 9 },
    { name: "All the Best Fail", orderIndex: 10 },
    { name: "Gun Violence", orderIndex: 11 },
    { name: "Designing for the Future", orderIndex: 12 },
    { name: "Do You Feel Privileged?", orderIndex: 13 },
    { name: "Climate Change", orderIndex: 14 },
    { name: "How to Save Money", orderIndex: 15 },
    { name: "Perfect Companions", orderIndex: 16 },
    { name: "Till Death Do Us Part", orderIndex: 17 },
    { name: "High-Tech Gloves", orderIndex: 18 },
    // Continue with more topics
    { name: "Social Media Influence", orderIndex: 19 },
    { name: "Artificial Intelligence", orderIndex: 20 },
    { name: "Sustainable Fashion", orderIndex: 21 },
    { name: "Mental Health Matters", orderIndex: 22 },
    { name: "Remote Work Revolution", orderIndex: 23 },
    { name: "Food Security", orderIndex: 24 },
    { name: "Electric Vehicles", orderIndex: 25 },
    { name: "Online Privacy Rights", orderIndex: 26 },
    { name: "Minimalist Living", orderIndex: 27 },
    { name: "Cryptocurrency", orderIndex: 28 },
    { name: "Gene Editing", orderIndex: 29 },
    { name: "Ocean Conservation", orderIndex: 30 },
    { name: "Virtual Reality", orderIndex: 31 },
    { name: "Gig Economy", orderIndex: 32 },
    { name: "Plant-Based Diets", orderIndex: 33 },
    { name: "Smart Homes", orderIndex: 34 },
    { name: "Cybersecurity", orderIndex: 35 },
    { name: "Space Exploration", orderIndex: 36 },
    { name: "Renewable Resources", orderIndex: 37 },
    { name: "Digital Nomads", orderIndex: 38 },
    { name: "Biotechnology", orderIndex: 39 },
    { name: "Future of Education", orderIndex: 40 },
  ],
  [Level.EXPERT]: [
    { name: "Girl Power", orderIndex: 1 },
    { name: "Make Up Your Mind", orderIndex: 2 },
    { name: "Child Labor", orderIndex: 3 },
    { name: "Advertising Then and Now", orderIndex: 4 },
    { name: "Shop Till You Drop", orderIndex: 5 },
    { name: "Online Privacy", orderIndex: 6 },
    { name: "Education Blues", orderIndex: 7 },
    { name: "A Legacy", orderIndex: 8 },
    { name: "Jobs of the Future", orderIndex: 9 },
    { name: "Money Makes the World Go Round", orderIndex: 10 },
    { name: "It's a Small World After All", orderIndex: 11 },
    { name: "Check It Out", orderIndex: 12 },
    { name: "Happy Holidays!", orderIndex: 13 },
    { name: "Fake News", orderIndex: 14 },
    { name: "Let's Go Outside", orderIndex: 15 },
    { name: "Medical Tourism", orderIndex: 16 },
    { name: "In the Year 2525", orderIndex: 17 },
    { name: "Addressing Violence", orderIndex: 18 },
    // Continue with more topics
    { name: "Ethical AI", orderIndex: 19 },
    { name: "Global Warming Solutions", orderIndex: 20 },
    { name: "Cultural Appropriation", orderIndex: 21 },
    { name: "Income Inequality", orderIndex: 22 },
    { name: "Political Polarization", orderIndex: 23 },
    { name: "Genetic Privacy", orderIndex: 24 },
    { name: "Corporate Responsibility", orderIndex: 25 },
    { name: "Media Manipulation", orderIndex: 26 },
    { name: "Environmental Justice", orderIndex: 27 },
    { name: "Automation Impact", orderIndex: 28 },
    { name: "Social Justice Movements", orderIndex: 29 },
    { name: "Data Ethics", orderIndex: 30 },
    { name: "Global Migration", orderIndex: 31 },
    { name: "Healthcare Innovation", orderIndex: 32 },
    { name: "Economic Sustainability", orderIndex: 33 },
    { name: "Digital Democracy", orderIndex: 34 },
    { name: "Human Rights in Tech", orderIndex: 35 },
    { name: "Climate Refugees", orderIndex: 36 },
    { name: "Future of Work", orderIndex: 37 },
    { name: "Universal Basic Income", orderIndex: 38 },
    { name: "Bioethics", orderIndex: 39 },
    { name: "Global Governance", orderIndex: 40 },
  ],
}

async function main() {
  console.log('Starting seed...')
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mindset.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  })
  console.log('Created admin user:', admin.email)

  // Create sample teachers
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'teacher1@mindset.com',
        password: teacherPassword,
        name: 'Maria Silva',
        role: UserRole.TEACHER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'teacher2@mindset.com',
        password: teacherPassword,
        name: 'John Smith',
        role: UserRole.TEACHER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'teacher3@mindset.com',
        password: teacherPassword,
        name: 'Ana Garcia',
        role: UserRole.TEACHER,
      },
    }),
  ])
  console.log('Created teachers:', teachers.length)

  // Create teacher availability (Monday to Friday, 9 AM to 6 PM)
  for (const teacher of teachers) {
    for (let day = 1; day <= 5; day++) { // Monday to Friday
      await prisma.availability.create({
        data: {
          teacherId: teacher.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
        },
      })
    }
  }
  console.log('Created teacher availability')

  // Create sample students with different levels
  const studentPassword = await bcrypt.hash('student123', 10)
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student1@mindset.com',
        password: studentPassword,
        name: 'Carlos Oliveira',
        role: UserRole.STUDENT,
        level: Level.STARTER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student2@mindset.com',
        password: studentPassword,
        name: 'Julia Santos',
        role: UserRole.STUDENT,
        level: Level.SURVIVOR,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student3@mindset.com',
        password: studentPassword,
        name: 'Pedro Costa',
        role: UserRole.STUDENT,
        level: Level.EXPLORER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student4@mindset.com',
        password: studentPassword,
        name: 'Isabella Rodriguez',
        role: UserRole.STUDENT,
        level: Level.EXPERT,
      },
    }),
  ])
  console.log('Created students:', students.length)

  // Create packages for students
  const currentDate = new Date()
  for (const student of students) {
    await prisma.package.create({
      data: {
        userId: student.id,
        totalLessons: 80,
        usedLessons: 0,
        remainingLessons: 80,
        validFrom: currentDate,
        validUntil: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()),
      },
    })
  }
  console.log('Created student packages')

  // Create topics for all levels
  for (const [level, topics] of Object.entries(topicsData)) {
    for (const topic of topics) {
      await prisma.topic.create({
        data: {
          name: topic.name,
          level: level as Level,
          orderIndex: topic.orderIndex,
          description: `Learn about ${topic.name.toLowerCase()} in this interactive lesson.`,
        },
      })
    }
  }
  console.log('Created all topics')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })