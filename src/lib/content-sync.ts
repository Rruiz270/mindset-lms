import { prisma } from './prisma'

// Content sync utilities to ensure consistency across roles
export class ContentSyncService {
  // Verify content access permissions based on user role
  static async verifyContentAccess(contentId: string, userRole: string): Promise<boolean> {
    try {
      const content = await prisma.content.findUnique({
        where: { id: contentId }
      })

      if (!content) return false

      switch (userRole) {
        case 'ADMIN':
          // Admins can access all content
          return true
        
        case 'TEACHER':
          // Teachers can access all content for teaching purposes
          return true
        
        case 'STUDENT':
          // Students can only access pre-class and post-class content
          return content.phase === 'pre_class' || content.phase === 'post_class'
        
        default:
          return false
      }
    } catch (error) {
      console.error('Error verifying content access:', error)
      return false
    }
  }

  // Get content based on user role and context
  static async getContentForUser(userId: string, userRole: string, filters?: {
    topicId?: string
    level?: string
    phase?: string
  }) {
    try {
      let whereClause: any = {}

      // Add filters if provided
      if (filters?.topicId) whereClause.topicId = filters.topicId
      if (filters?.level) whereClause.level = filters.level
      if (filters?.phase) whereClause.phase = filters.phase

      // Apply role-based filtering
      if (userRole === 'STUDENT') {
        // Students only see pre-class and post-class content
        whereClause.phase = {
          in: ['pre_class', 'post_class']
        }
      }

      const content = await prisma.content.findMany({
        where: whereClause,
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              level: true,
              orderIndex: true,
              description: true
            }
          }
        },
        orderBy: [
          { topic: { orderIndex: 'asc' } },
          { 
            phase: 'asc' // This will be sorted by enum order
          },
          { order: 'asc' }
        ]
      })

      return content
    } catch (error) {
      console.error('Error getting content for user:', error)
      return []
    }
  }

  // Sync content availability for a booking
  static async syncContentForBooking(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          topic: true,
          student: true
        }
      })

      if (!booking) return

      // Check if student has completed pre-class content
      const preClassContent = await prisma.content.findMany({
        where: {
          topicId: booking.topicId,
          phase: 'pre_class'
        }
      })

      // Create progress records for pre-class content if not exists
      for (const content of preClassContent) {
        await prisma.progress.upsert({
          where: {
            userId_topicId: {
              userId: booking.studentId,
              topicId: booking.topicId
            }
          },
          update: {},
          create: {
            userId: booking.studentId,
            topicId: booking.topicId,
            preClassComplete: false,
            liveClassAttended: false,
            afterClassComplete: false
          }
        })
      }
    } catch (error) {
      console.error('Error syncing content for booking:', error)
    }
  }

  // Get content completion status for a student
  static async getStudentContentProgress(studentId: string, topicId?: string) {
    try {
      const whereClause: any = { userId: studentId }
      if (topicId) whereClause.topicId = topicId

      const progress = await prisma.progress.findMany({
        where: whereClause,
        include: {
          topic: {
            include: {
              contents: {
                select: {
                  id: true,
                  title: true,
                  phase: true,
                  type: true
                }
              }
            }
          }
        }
      })

      // Calculate completion rates
      const progressWithStats = progress.map(p => {
        const contents = p.topic.contents
        const preClassCount = contents.filter(c => c.phase === 'pre_class').length
        const postClassCount = contents.filter(c => c.phase === 'post_class').length

        return {
          ...p,
          stats: {
            preClassProgress: p.preClassComplete ? 100 : 0,
            liveClassProgress: p.liveClassAttended ? 100 : 0,
            postClassProgress: p.afterClassComplete ? 100 : 0,
            totalContents: preClassCount + postClassCount,
            completedContents: 
              (p.preClassComplete ? preClassCount : 0) + 
              (p.afterClassComplete ? postClassCount : 0)
          }
        }
      })

      return progressWithStats
    } catch (error) {
      console.error('Error getting student content progress:', error)
      return []
    }
  }

  // Validate content before creation/update
  static async validateContent(contentData: any) {
    const errors = []

    // Required fields
    if (!contentData.title) errors.push('Title is required')
    if (!contentData.description) errors.push('Description is required')
    if (!contentData.type) errors.push('Type is required')
    if (!contentData.phase) errors.push('Phase is required')
    if (!contentData.topicId) errors.push('Topic ID is required')
    if (!contentData.level) errors.push('Level is required')

    // Validate type
    const validTypes = ['reading', 'video', 'audio', 'exercise', 'quiz', 'discussion']
    if (contentData.type && !validTypes.includes(contentData.type)) {
      errors.push('Invalid content type')
    }

    // Validate phase
    const validPhases = ['pre_class', 'live_class', 'post_class']
    if (contentData.phase && !validPhases.includes(contentData.phase)) {
      errors.push('Invalid content phase')
    }

    // Validate duration
    if (contentData.duration && (contentData.duration < 1 || contentData.duration > 180)) {
      errors.push('Duration must be between 1 and 180 minutes')
    }

    // Check if topic exists
    if (contentData.topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: contentData.topicId }
      })
      if (!topic) errors.push('Topic not found')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Sync content order within a topic and phase
  static async syncContentOrder(topicId: string, phase: string) {
    try {
      const contents = await prisma.content.findMany({
        where: {
          topicId,
          phase
        },
        orderBy: {
          order: 'asc'
        }
      })

      // Re-number the order to ensure no gaps
      for (let i = 0; i < contents.length; i++) {
        await prisma.content.update({
          where: { id: contents[i].id },
          data: { order: i + 1 }
        })
      }
    } catch (error) {
      console.error('Error syncing content order:', error)
    }
  }
}