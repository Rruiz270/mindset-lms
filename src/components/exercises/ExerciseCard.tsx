'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface Exercise {
  id: string;
  title: string;
  instructions: string;
  type: string;
  category: string;
  phase: string;
  content: any;
  points: number;
  submissions?: Array<{
    id: string;
    score: number;
    submittedAt: string;
    feedback: string;
  }>;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onSubmit?: () => void;
}

export default function ExerciseCard({ exercise, onSubmit }: ExerciseCardProps) {
  const [answer, setAnswer] = useState<any>('');
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(exercise.submissions?.[0]);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = async () => {
    if (!answer) return;

    setSubmitting(true);
    try {
      const response = await axios.post('/api/exercises/submit', {
        exerciseId: exercise.id,
        answer,
      });
      
      setSubmission(response.data);
      setShowFeedback(true);
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      alert('Failed to submit exercise. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">{exercise.content.question}</p>
            <RadioGroup value={answer} onValueChange={setAnswer}>
              {exercise.content.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">{exercise.content.statement}</p>
            <RadioGroup value={answer} onValueChange={setAnswer}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'GAP_FILL':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              {exercise.content.text.replace('___', '_____')}
            </p>
            <Input
              placeholder="Fill in the blank"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        );

      case 'ESSAY':
      case 'ERROR_CORRECTION':
        return (
          <div className="space-y-4">
            {exercise.content.prompt && (
              <p className="text-sm text-gray-700">{exercise.content.prompt}</p>
            )}
            {exercise.content.text && (
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {exercise.content.text}
              </p>
            )}
            <Textarea
              placeholder="Write your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
            />
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Exercise type {exercise.type} is not yet implemented.
          </div>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      READING: 'bg-blue-100 text-blue-800',
      WRITING: 'bg-green-100 text-green-800',
      LISTENING: 'bg-purple-100 text-purple-800',
      SPEAKING: 'bg-orange-100 text-orange-800',
      GRAMMAR: 'bg-yellow-100 text-yellow-800',
      VOCABULARY: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const hasSubmitted = submission && submission.score !== null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{exercise.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(exercise.category)}`}>
                {exercise.category}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                {exercise.points} points
              </span>
              {hasSubmitted && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {submission.score}/{exercise.points}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{exercise.instructions}</p>
        
        {renderExerciseContent()}

        {showFeedback && submission && (
          <div className={`p-3 rounded-lg ${
            submission.score === exercise.points 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {submission.score === exercise.points ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                Score: {submission.score}/{exercise.points}
              </span>
            </div>
            {submission.feedback && (
              <p className="mt-2 text-sm">{submission.feedback}</p>
            )}
          </div>
        )}

        {!hasSubmitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={!answer || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Answer'
            )}
          </Button>
        )}

        {hasSubmitted && !showFeedback && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Already submitted • Score: {submission.score}/{exercise.points}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFeedback(true)}
            >
              View Feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}