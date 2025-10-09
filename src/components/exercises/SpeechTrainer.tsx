'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface SpeechTrainerProps {
  text: string;
  targetPhrase: string;
  onComplete?: (score: number, audioBlob: Blob) => void;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export default function SpeechTrainer({ 
  text, 
  targetPhrase, 
  onComplete,
  difficulty = 'beginner' 
}: SpeechTrainerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if speech recognition and media recorder are supported
    const isSupported = 
      typeof window !== 'undefined' && 
      'MediaRecorder' in window && 
      'speechSynthesis' in window;
    
    setSpeechSupported(isSupported);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        analyzeRecording(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeRecording = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate speech analysis (in a real app, this would call a speech recognition API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result based on difficulty
      const baseScore = Math.random() * 40 + 60; // 60-100 range
      const difficultyMultiplier = {
        beginner: 1.0,
        intermediate: 0.9,
        advanced: 0.8
      }[difficulty];
      
      const finalScore = Math.min(100, Math.max(0, baseScore * difficultyMultiplier));
      
      const mockResult = {
        overallScore: Math.round(finalScore),
        pronunciation: Math.round(finalScore * 0.9),
        fluency: Math.round(finalScore * 1.1),
        accuracy: Math.round(finalScore * 0.95),
        feedback: getFeedback(finalScore),
        wordsAnalyzed: targetPhrase.split(' ').map((word, index) => ({
          word,
          score: Math.round(finalScore + (Math.random() - 0.5) * 20),
          correct: Math.random() > 0.3
        }))
      };
      
      setAnalysisResult(mockResult);
      
      if (onComplete) {
        onComplete(mockResult.overallScore, audioBlob);
      }
    } catch (error) {
      console.error('Error analyzing speech:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFeedback = (score: number): string[] => {
    if (score >= 90) {
      return ['Excellent pronunciation!', 'Great fluency and clarity.', 'Keep up the good work!'];
    } else if (score >= 75) {
      return ['Good pronunciation overall.', 'Try to speak a bit more clearly.', 'Focus on word stress.'];
    } else if (score >= 60) {
      return ['Pronunciation needs improvement.', 'Practice speaking more slowly.', 'Focus on individual sounds.'];
    } else {
      return ['Keep practicing!', 'Break down the phrase into smaller parts.', 'Listen to the model pronunciation.'];
    }
  };

  const playModelAudio = () => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(targetPhrase);
      utterance.rate = 0.8; // Slower for learning
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playRecordedAudio = () => {
    if (recordedAudio) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  if (!speechSupported) {
    return (
      <Card className="exercise-card">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <MicOff className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Speech Training Unavailable</h3>
          <p className="text-gray-600">
            Your browser doesn't support speech recognition. Please use a modern browser like Chrome or Firefox.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="exercise-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-speaking" />
          Speech Training
          <span className="category-badge category-speaking text-xs">
            {difficulty.toUpperCase()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Instructions:</strong> {text}
          </p>
          <p className="text-lg font-semibold text-blue-900">
            Say: "{targetPhrase}"
          </p>
        </div>

        {/* Model Audio */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={playModelAudio}
            disabled={isPlaying}
            className="flex items-center gap-2"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Listen to Model
          </Button>
          <span className="text-sm text-gray-600">Click to hear the correct pronunciation</span>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isAnalyzing}
              className="flex items-center gap-2 btn-mindset"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <MicOff className="h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {recordedAudio && !isAnalyzing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={playRecordedAudio}
                disabled={isPlaying}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Play Recording
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetRecording}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording... Speak clearly!</span>
          </div>
        )}

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="text-center py-6">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Analyzing your pronunciation...</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">
                Analysis Results - Score: {analysisResult.overallScore}/100
              </h4>
              
              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pronunciation</span>
                    <span>{analysisResult.pronunciation}%</span>
                  </div>
                  <Progress value={analysisResult.pronunciation} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fluency</span>
                    <span>{analysisResult.fluency}%</span>
                  </div>
                  <Progress value={analysisResult.fluency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span>{analysisResult.accuracy}%</span>
                  </div>
                  <Progress value={analysisResult.accuracy} className="h-2" />
                </div>
              </div>

              {/* Word-by-word Analysis */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-green-800 mb-2">Word Analysis:</h5>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.wordsAnalyzed.map((word: any, index: number) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs ${
                        word.correct 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {word.word} ({word.score}%)
                    </span>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <h5 className="text-sm font-medium text-green-800 mb-2">Feedback:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  {analysisResult.feedback.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}