'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import Navbar from '@/components/layout/navbar';

interface TeacherGuide {
  id: string;
  topicName: string;
  courseType: string;
  duration: number;
  objectives: string[];
  materials: string[];
  lessonPlan: {
    phase: string;
    duration: number;
    activity: string;
    instructions: string;
    tips: string[];
  }[];
  teachingTips: string[];
  commonMistakes: string[];
  assessmentCriteria: string[];
  homework: {
    title: string;
    description: string;
    timeToComplete: number;
  };
  followUp: string[];
}

export default function TeacherGuidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const materialId = params.materialId as string;
  
  const [guide, setGuide] = useState<TeacherGuide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'TEACHER') {
      router.push('/dashboard');
    } else {
      fetchGuide();
    }
  }, [status, session, router, materialId]);

  const fetchGuide = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data based on materialId
      const mockGuide: TeacherGuide = {
        id: materialId,
        topicName: materialId === 'topic-1' ? 'Shopping: How Much Is It?' : 
                   materialId === 'topic-5' ? 'Travel: Getting Around' :
                   'Business English: Presentations',
        courseType: materialId === 'topic-1' ? 'Smart Learning' :
                   materialId === 'topic-5' ? 'Smart Conversation' :
                   'Private Lessons',
        duration: 60,
        objectives: [
          'Students will learn numbers 1-100',
          'Students will practice asking about prices',
          'Students will use "How much is/are...?" structure',
          'Students will practice shopping vocabulary',
          'Students will role-play shopping scenarios'
        ],
        materials: [
          'Price tags with different amounts',
          'Shopping items (real or pictures)',
          'Audio recordings of prices',
          'Interactive whiteboard',
          'Student worksheets',
          'Google Meet link'
        ],
        lessonPlan: [
          {
            phase: 'Warm-up & Review',
            duration: 10,
            activity: 'Greeting and Previous Lesson Review',
            instructions: 'Start with a warm greeting. Ask students about their last shopping experience. Review any homework from the previous class.',
            tips: [
              'Use students\' names to create a personal connection',
              'Keep the warm-up light and engaging',
              'Address any questions from previous lessons'
            ]
          },
          {
            phase: 'Vocabulary Introduction',
            duration: 15,
            activity: 'Shopping Vocabulary',
            instructions: 'Introduce key shopping vocabulary: store, price, money, buy, sell, expensive, cheap. Use visual aids and real examples.',
            tips: [
              'Show real price tags and items',
              'Practice pronunciation of each word',
              'Use gestures to help with meaning',
              'Get students to repeat chorally and individually'
            ]
          },
          {
            phase: 'Grammar Practice',
            duration: 15,
            activity: 'How much is/are...? structure',
            instructions: 'Teach the grammar structure for asking about prices. Practice with singular and plural forms.',
            tips: [
              'Emphasize the difference between "is" and "are"',
              'Use plenty of examples with different items',
              'Have students create their own questions',
              'Correct pronunciation gently'
            ]
          },
          {
            phase: 'Communication Activity',
            duration: 15,
            activity: 'Shopping Role-play',
            instructions: 'Pair students for role-play activities. One student is the customer, the other is the shopkeeper.',
            tips: [
              'Circulate and help with vocabulary',
              'Encourage natural conversation',
              'Take notes on common errors to address later',
              'Praise good attempts even if not perfect'
            ]
          },
          {
            phase: 'Review & Homework',
            duration: 5,
            activity: 'Lesson Summary and Assignment',
            instructions: 'Summarize key points learned. Assign homework: visit a store and note 5 prices to practice at home.',
            tips: [
              'Ask students what they learned',
              'Clarify any remaining doubts',
              'Remind about next class topic',
              'Send homework instructions via email'
            ]
          }
        ],
        teachingTips: [
          'Use real prices from local stores to make it relevant',
          'Encourage students to practice numbers before the class',
          'Role-play different shopping scenarios (grocery store, clothing, electronics)',
          'Be patient with pronunciation - numbers can be challenging',
          'Use visual aids as much as possible',
          'Create a supportive environment where students feel safe to make mistakes',
          'Vary your teaching methods to accommodate different learning styles',
          'Give positive feedback frequently to build confidence'
        ],
        commonMistakes: [
          'Confusing "How much is" vs "How much are"',
          'Pronunciation of numbers (especially teens vs tens)',
          'Forgetting to use "dollars" or currency terms',
          'Using wrong stress patterns in compound words',
          'Mixing up "expensive" and "cheap" meanings'
        ],
        assessmentCriteria: [
          'Correct use of "How much is/are" structure',
          'Appropriate vocabulary usage',
          'Clear pronunciation of numbers',
          'Natural conversation flow in role-play',
          'Active participation in class activities'
        ],
        homework: {
          title: 'Real-world Price Investigation',
          description: 'Visit a local store (grocery, clothing, or electronics) and write down 5 items with their prices. Practice asking "How much is/are..." questions for each item.',
          timeToComplete: 30
        },
        followUp: [
          'Review homework answers in next class',
          'Continue with related topics: making purchases, giving change',
          'Plan a virtual shopping trip using online stores',
          'Introduce more complex shopping vocabulary (discount, sale, receipt)'
        ]
      };

      setGuide(mockGuide);
    } catch (error) {
      console.error('Error fetching guide:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'TEACHER' || !guide) {
    return <div className="min-h-screen flex items-center justify-center">Access denied or guide not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/teacher')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teacher Guide
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{guide.topicName}</span>
              <Badge variant="outline">{guide.courseType}</Badge>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{guide.duration} minutes</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lesson-plan">Lesson Plan</TabsTrigger>
            <TabsTrigger value="tips">Teaching Tips</TabsTrigger>
            <TabsTrigger value="mistakes">Common Mistakes</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guide.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Required Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guide.materials.map((material, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{material}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lesson Plan Tab */}
          <TabsContent value="lesson-plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Detailed Lesson Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {guide.lessonPlan.map((phase, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-6 pb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-blue-600">
                          {phase.duration} min
                        </Badge>
                        <h3 className="font-semibold text-lg">{phase.phase}</h3>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2">
                        Activity: {phase.activity}
                      </h4>
                      
                      <p className="text-gray-700 mb-4">
                        {phase.instructions}
                      </p>
                      
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          Teaching Tips:
                        </h5>
                        <ul className="space-y-1">
                          {phase.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-yellow-600">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teaching Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  General Teaching Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guide.teachingTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Common Mistakes Tab */}
          <TabsContent value="mistakes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Common Student Mistakes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guide.commonMistakes.map((mistake, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{mistake}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Assessment Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guide.assessmentCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{criteria}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Homework Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{guide.homework.title}</h3>
                    <p className="text-gray-700 mb-4">{guide.homework.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Estimated time: {guide.homework.timeToComplete} minutes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Follow-up Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guide.followUp.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}