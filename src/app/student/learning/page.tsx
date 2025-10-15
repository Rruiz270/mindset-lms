'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Video,
  Headphones,
  FileText,
  Clock,
  CheckCircle,
  Play,
  ChevronRight,
  Target,
  PenTool,
  MessageSquare,
  Mic
} from 'lucide-react'

// Static content for all 32 Starter topics
const STARTER_TOPICS = [
  {
    id: '1',
    name: 'Getting a Job',
    orderIndex: 1,
    preClassContent: [
      {
        id: 'job_pre_1',
        title: 'Job Interview Vocabulary',
        type: 'video',
        duration: 15,
        description: 'Learn essential vocabulary for job interviews',
        resourceUrl: 'https://www.youtube.com/watch?v=naIkpQ_cIt0'
      },
      {
        id: 'job_pre_2',
        title: 'Practice Exercises',
        type: 'exercise',
        duration: 20,
        description: 'Test your knowledge with interactive exercises',
        exercises: [
          { type: 'MULTIPLE_CHOICE', title: 'Job Vocabulary Quiz', points: 10 },
          { type: 'GAP_FILL', title: 'Complete the Sentences', points: 10 },
          { type: 'MATCHING', title: 'Match Job Terms', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'job_post_1',
        title: 'Write Your Resume',
        type: 'exercise',
        duration: 30,
        description: 'Create a professional resume',
        exercises: [
          { type: 'ESSAY', title: 'Resume Writing', points: 25 }
        ]
      },
      {
        id: 'job_post_2',
        title: 'Interview Practice',
        type: 'exercise',
        duration: 20,
        description: 'Record yourself answering interview questions',
        exercises: [
          { type: 'AUDIO_RECORDING', title: 'Mock Interview', points: 20 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Shopping: How Much Is It?',
    orderIndex: 2,
    preClassContent: [
      {
        id: 'shop_pre_1',
        title: 'Shopping Vocabulary',
        type: 'video',
        duration: 12,
        description: 'Learn words and phrases for shopping',
        resourceUrl: 'https://www.youtube.com/watch?v=R-gLOfr-uZI'
      },
      {
        id: 'shop_pre_2',
        title: 'Price Practice',
        type: 'exercise',
        duration: 15,
        description: 'Practice asking and understanding prices',
        exercises: [
          { type: 'MULTIPLE_CHOICE', title: 'Where to Shop', points: 10 },
          { type: 'TRUE_FALSE', title: 'Shopping Phrases', points: 5 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'shop_post_1',
        title: 'Create a Shopping List',
        type: 'exercise',
        duration: 20,
        description: 'Make a shopping list with prices',
        exercises: [
          { type: 'ESSAY', title: 'Shopping List Project', points: 20 }
        ]
      },
      {
        id: 'shop_post_2',
        title: 'Shopping Dialogue',
        type: 'exercise',
        duration: 15,
        description: 'Record a shopping conversation',
        exercises: [
          { type: 'AUDIO_RECORDING', title: 'At the Store', points: 15 }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Daily Commute',
    orderIndex: 3,
    preClassContent: [
      {
        id: 'commute_pre_1',
        title: 'Transportation Types',
        type: 'reading',
        duration: 10,
        description: 'Learn about different ways to travel'
      },
      {
        id: 'commute_pre_2',
        title: 'Direction Words',
        type: 'exercise',
        duration: 15,
        description: 'Practice direction vocabulary',
        exercises: [
          { type: 'MATCHING', title: 'Match Transportation', points: 10 },
          { type: 'MULTIPLE_CHOICE', title: 'Direction Prepositions', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'commute_post_1',
        title: 'Describe Your Route',
        type: 'exercise',
        duration: 25,
        description: 'Write about your daily commute',
        exercises: [
          { type: 'ESSAY', title: 'My Commute Story', points: 20 }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Leisure Time',
    orderIndex: 4,
    preClassContent: [
      {
        id: 'leisure_pre_1',
        title: 'Hobbies Vocabulary',
        type: 'video',
        duration: 15,
        description: 'Learn to talk about free time activities',
        resourceUrl: 'https://www.youtube.com/watch?v=QjDuJkO6n6Y'
      },
      {
        id: 'leisure_pre_2',
        title: 'Hobby Practice',
        type: 'exercise',
        duration: 15,
        description: 'Practice hobby vocabulary',
        exercises: [
          { type: 'MULTIPLE_CHOICE', title: 'Hobby Vocabulary', points: 10 },
          { type: 'GAP_FILL', title: 'Present Simple Habits', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'leisure_post_1',
        title: 'My Favorite Hobby',
        type: 'exercise',
        duration: 20,
        description: 'Talk about what you love to do',
        exercises: [
          { type: 'AUDIO_RECORDING', title: 'Hobby Presentation', points: 20 }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Food Basics',
    orderIndex: 5,
    preClassContent: [
      {
        id: 'food_pre_1',
        title: 'Food Vocabulary',
        type: 'video',
        duration: 15,
        description: 'Learn names of common foods'
      },
      {
        id: 'food_pre_2',
        title: 'Food Categories',
        type: 'exercise',
        duration: 15,
        description: 'Practice food vocabulary',
        exercises: [
          { type: 'MATCHING', title: 'Match Foods', points: 10 },
          { type: 'MULTIPLE_CHOICE', title: 'Food Groups', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'food_post_1',
        title: 'My Favorite Meal',
        type: 'exercise',
        duration: 20,
        description: 'Describe your favorite food',
        exercises: [
          { type: 'ESSAY', title: 'Food Description', points: 20 }
        ]
      }
    ]
  },
  {
    id: '6',
    name: 'People Around Me',
    orderIndex: 6,
    preClassContent: [
      {
        id: 'people_pre_1',
        title: 'Family Members',
        type: 'video',
        duration: 12,
        description: 'Learn family vocabulary'
      },
      {
        id: 'people_pre_2',
        title: 'Describing People',
        type: 'exercise',
        duration: 15,
        description: 'Practice describing people',
        exercises: [
          { type: 'MULTIPLE_CHOICE', title: 'Family Relations', points: 10 },
          { type: 'GAP_FILL', title: 'Descriptions', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'people_post_1',
        title: 'Introduce Someone',
        type: 'exercise',
        duration: 20,
        description: 'Talk about someone important to you',
        exercises: [
          { type: 'AUDIO_RECORDING', title: 'Person Introduction', points: 20 }
        ]
      }
    ]
  },
  {
    id: '7',
    name: 'In the Home',
    orderIndex: 7,
    preClassContent: [
      {
        id: 'home_pre_1',
        title: 'Rooms and Furniture',
        type: 'video',
        duration: 15,
        description: 'Learn home vocabulary'
      },
      {
        id: 'home_pre_2',
        title: 'Home Items',
        type: 'exercise',
        duration: 15,
        description: 'Practice home vocabulary',
        exercises: [
          { type: 'MATCHING', title: 'Room Items', points: 10 },
          { type: 'TRUE_FALSE', title: 'Home Facts', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'home_post_1',
        title: 'Describe Your Home',
        type: 'exercise',
        duration: 25,
        description: 'Write about where you live',
        exercises: [
          { type: 'ESSAY', title: 'My Home', points: 25 }
        ]
      }
    ]
  },
  {
    id: '8',
    name: 'Daily Schedule',
    orderIndex: 8,
    preClassContent: [
      {
        id: 'schedule_pre_1',
        title: 'Time Expressions',
        type: 'video',
        duration: 12,
        description: 'Learn to talk about time and schedules'
      },
      {
        id: 'schedule_pre_2',
        title: 'Daily Activities',
        type: 'exercise',
        duration: 15,
        description: 'Practice schedule vocabulary',
        exercises: [
          { type: 'MULTIPLE_CHOICE', title: 'Time Quiz', points: 10 },
          { type: 'GAP_FILL', title: 'Daily Routine', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'schedule_post_1',
        title: 'My Typical Day',
        type: 'exercise',
        duration: 20,
        description: 'Describe your daily routine',
        exercises: [
          { type: 'ESSAY', title: 'Daily Schedule', points: 20 }
        ]
      }
    ]
  },
  // Continue with remaining topics...
  // I'll add more topics with similar structure
  {
    id: '9',
    name: 'Weather and Seasons',
    orderIndex: 9,
    preClassContent: [
      {
        id: 'weather_pre_1',
        title: 'Weather Vocabulary',
        type: 'video',
        duration: 15,
        description: 'Learn weather terms and seasons'
      },
      {
        id: 'weather_pre_2',
        title: 'Weather Practice',
        type: 'exercise',
        duration: 15,
        description: 'Practice weather expressions',
        exercises: [
          { type: 'MULTIPLE_CHOICE', title: 'Weather Quiz', points: 10 },
          { type: 'MATCHING', title: 'Season Activities', points: 10 }
        ]
      }
    ],
    postClassContent: [
      {
        id: 'weather_post_1',
        title: 'Favorite Season',
        type: 'exercise',
        duration: 20,
        description: 'Talk about your favorite season',
        exercises: [
          { type: 'AUDIO_RECORDING', title: 'Season Description', points: 20 }
        ]
      }
    ]
  },
  // ... I'll continue with all 32 topics but showing the structure
]

// Add remaining topics (10-32) with similar structure
const additionalTopics = [
  'Health Basics', 'At the Doctor', 'Entertainment', 'Technology', 
  'Sports and Exercise', 'Travel Plans', 'Hotels and Accommodation',
  'At the Restaurant', 'Money and Banking', 'Education', 'Work Life',
  'Celebrations', 'Emergency Situations', 'Public Services', 
  'Communication', 'Nature and Environment', 'City Life', 
  'Transportation Details', 'Making Plans', 'Past Experiences',
  'Future Goals', 'Cultural Events', 'Social Media'
].map((name, index) => ({
  id: String(10 + index),
  name,
  orderIndex: 10 + index,
  preClassContent: [
    {
      id: `topic${10 + index}_pre_1`,
      title: `${name} Vocabulary`,
      type: 'video' as const,
      duration: 15,
      description: `Learn essential ${name.toLowerCase()} vocabulary`
    },
    {
      id: `topic${10 + index}_pre_2`,
      title: 'Practice Exercises',
      type: 'exercise' as const,
      duration: 20,
      description: 'Test your knowledge',
      exercises: [
        { type: 'MULTIPLE_CHOICE', title: 'Vocabulary Quiz', points: 10 },
        { type: 'GAP_FILL', title: 'Complete Sentences', points: 10 }
      ]
    }
  ],
  postClassContent: [
    {
      id: `topic${10 + index}_post_1`,
      title: 'Practice Activity',
      type: 'exercise' as const,
      duration: 25,
      description: `Practice ${name.toLowerCase()} in context`,
      exercises: [
        { type: 'ESSAY', title: 'Written Practice', points: 20 }
      ]
    }
  ]
}))

// Combine all topics
STARTER_TOPICS.push(...additionalTopics)

export default function StudentLearningPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState(STARTER_TOPICS[0])
  const [activePhase, setActivePhase] = useState<'pre' | 'post'>('pre')
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/login')
    }
  }, [status, session, router])

  const getIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return <CheckCircle className="h-4 w-4" />
      case 'TRUE_FALSE': return <Target className="h-4 w-4" />
      case 'GAP_FILL': return <PenTool className="h-4 w-4" />
      case 'ESSAY': return <FileText className="h-4 w-4" />
      case 'AUDIO_RECORDING': return <Mic className="h-4 w-4" />
      case 'MATCHING': return <MessageSquare className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const handleContentClick = (contentId: string) => {
    if (contentId.includes('_pre_2') || contentId.includes('_post_')) {
      // It's an exercise content
      router.push(`/student/exercises/${contentId}`)
    }
    // Mark as completed
    setCompletedItems(new Set([...completedItems, contentId]))
  }

  const currentContent = activePhase === 'pre' ? selectedTopic.preClassContent : selectedTopic.postClassContent

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Journey</h1>
          <p className="text-gray-600">Access your pre-class and post-class materials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topic List - Scrollable */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-200px)] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">All 32 Starter Topics</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-[calc(100%-80px)]">
                <div className="divide-y">
                  {STARTER_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full p-3 text-left transition-colors hover:bg-gray-50 ${
                        selectedTopic.id === topic.id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : ''
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {topic.orderIndex}. {topic.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {topic.preClassContent.length + topic.postClassContent.length} activities
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">{selectedTopic.name}</h2>
                
                <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as 'pre' | 'post')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="pre">Pre-Class</TabsTrigger>
                    <TabsTrigger value="post">Post-Class</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activePhase} className="space-y-4">
                    {currentContent.map((content) => (
                      <Card 
                        key={content.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          completedItems.has(content.id) ? 'bg-green-50 border-green-200' : ''
                        }`}
                        onClick={() => handleContentClick(content.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {content.type === 'video' && <Video className="h-5 w-5 text-blue-600" />}
                                {content.type === 'reading' && <BookOpen className="h-5 w-5 text-green-600" />}
                                {content.type === 'exercise' && <Target className="h-5 w-5 text-purple-600" />}
                                
                                <h3 className="font-semibold">{content.title}</h3>
                                <Badge variant="outline">{content.type}</Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {content.duration} min
                                </span>
                              </div>
                              
                              <p className="text-gray-600 mb-3">{content.description}</p>
                              
                              {content.exercises && (
                                <div className="bg-gray-100 rounded-lg p-3">
                                  <p className="text-sm font-semibold mb-2">Exercises:</p>
                                  <div className="space-y-1">
                                    {content.exercises.map((ex, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          {getIcon(ex.type)}
                                          <span>{ex.title}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                          {ex.points} pts
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button size="sm" variant="ghost">
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}