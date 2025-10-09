# Mindset LMS

A comprehensive Language Learning Management System built for Mindset Institute, supporting both English and Spanish learning with an open entry system.

## Features

✅ **Completed Features:**
- Complete A0-A1 Starter Level with 32 CEFR-aligned topics
- Modern UI/UX with Mindset LMS branding and styling
- Pre-class exercises (Reading, Writing, Listening, Speaking, Grammar)
- Live class slides system (5-slide structure per topic)
- Post-class homework system with automated grading
- Speech recognition for pronunciation practice
- Google Calendar and Meet integration
- Role-based authentication (Student, Teacher, Admin)
- Student dashboard with progress tracking
- Teacher dashboard with availability management
- Admin dashboard with user and content management
- Credit/lesson tracking system with booking validation
- Responsive design for all devices

🚧 **Next Development Phase:**
- Implement Survivor, Explorer, and Expert levels
- Advanced analytics and reporting
- Mobile app optimization
- Enhanced speech recognition features

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Tailwind CSS with CSS Variables

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mindset-lms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and other configurations:
```
DATABASE_URL="postgresql://username:password@localhost:5432/mindset_lms"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Demo Accounts

After running the seed script, you can use these demo accounts:

**Admin:**
- Email: `admin@mindset.com`
- Password: `admin123`

**Teachers:**
- Email: `teacher1@mindset.com` / Password: `teacher123`
- Email: `teacher2@mindset.com` / Password: `teacher123`
- Email: `teacher3@mindset.com` / Password: `teacher123`

**Students:**
- Email: `student1@mindset.com` / Password: `student123` (Starter Level)
- Email: `student2@mindset.com` / Password: `student123` (Survivor Level)
- Email: `student3@mindset.com` / Password: `student123` (Explorer Level)
- Email: `student4@mindset.com` / Password: `student123` (Expert Level)

## Database Schema

### Key Models:

- **User**: Students, Teachers, and Admins with role-based access
- **Topic**: 40 topics per level with cycling system
- **Booking**: Class scheduling with 6-hour cancellation policy
- **Package**: Student lesson credits (e.g., 80 lessons for 1 year)
- **Exercise**: Pre-class and after-class activities
- **Slide**: Live class presentation materials
- **Availability**: Teacher scheduling availability

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── student/           # Student dashboard
│   ├── teacher/           # Teacher dashboard (TBD)
│   └── admin/             # Admin dashboard (TBD)
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── exercises/        # Exercise components (TBD)
│   └── calendar/         # Calendar components (TBD)
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── i18n/                 # Internationalization
```

## Learning System Architecture

### Open Entry System
Students can enroll at any time and immediately start taking classes based on their level.

### Level Structure
1. **Starter** (Beginner): Basic English fundamentals
2. **Survivor** (Elementary): Everyday communication
3. **Explorer** (Intermediate): Complex topics and discussions
4. **Expert** (Advanced): Professional and academic English

### Class Flow
1. **Pre-Class Activities**: Exercises to prepare for the topic
2. **Live Class**: 1-hour interactive session (max 10 students)
3. **After-Class Activities**: Homework to reinforce learning

### Credit System
- Students purchase packages (e.g., 80 lessons for 1 year)
- Each live class attendance deducts 1 credit
- Cancellations within 6 hours count as used credits
- Bookings allowed up to 1 hour before class

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Student APIs
- `GET /api/student/package` - Get student package information
- `GET /api/topics?level=STARTER` - Get topics by level

### Upcoming APIs
- `POST /api/bookings` - Book a class
- `GET /api/bookings` - Get user bookings
- `DELETE /api/bookings/{id}` - Cancel booking
- `GET /api/exercises` - Get exercises by topic and phase
- `POST /api/submissions` - Submit exercise answers

## Next Steps

### Priority Development:
1. **Calendar Integration**: Google Calendar API for scheduling
2. **Exercise System**: Interactive exercises for all categories
3. **Live Class Slides**: Interactive presentation system
4. **Speech Recognition**: Pronunciation practice and feedback
5. **Teacher Dashboard**: Class management and student progress
6. **Admin Panel**: User management and system configuration

### Future Enhancements:
- Mobile app using React Native
- Advanced analytics and reporting
- Gamification with badges and achievements
- Integration with external assessment tools
- Automated lesson content generation
- Video recording and playback for classes

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Include appropriate tests
5. Update documentation

## License

This project is proprietary software for Mindset Institute.