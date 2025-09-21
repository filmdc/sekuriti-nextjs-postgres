'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useSWR from 'swr';
import { ExerciseWithQuestions, ExerciseAnswer } from '@/lib/types/exercise';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ExerciseStartPageProps {
  params: {
    id: string;
  };
}

export default function ExerciseStartPage({ params }: ExerciseStartPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Fetch exercise data
  const { data: exercise, error: exerciseError } = useSWR<ExerciseWithQuestions>(
    `/api/exercises/${params.id}`,
    fetcher
  );

  // Fetch or create session
  const { data: session, error: sessionError, mutate: mutateSession } = useSWR(
    `/api/exercises/${params.id}/session`,
    fetcher
  );

  // Initialize session and answers
  useEffect(() => {
    if (session) {
      setSessionId(session.id);
      if (session.answers) {
        setAnswers(session.answers);
      }
      if (session.currentQuestion !== undefined) {
        setCurrentQuestion(session.currentQuestion);
      }
      if (session.timeRemaining !== undefined && session.timeRemaining !== null) {
        setTimeRemaining(session.timeRemaining);
      }
    }
  }, [session]);

  // Timer logic
  useEffect(() => {
    if (!exercise?.estimatedDuration || isPaused || !timeRemaining) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exercise, isPaused, timeRemaining]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (!isPaused && sessionId) {
        handleSaveProgress(true);
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [answers, currentQuestion, sessionId, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSaveProgress = async (silent = false) => {
    if (!sessionId || !exercise) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/exercises/${params.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers,
          currentQuestion,
          timeRemaining
        })
      });

      if (!response.ok) throw new Error('Failed to save progress');

      if (!silent) {
        toast({
          title: 'Progress saved',
          description: 'Your answers have been saved. You can continue later.'
        });
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: 'Save failed',
          description: 'Could not save your progress. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!exercise || !sessionId) return;

    // Check if all questions are answered
    const unansweredQuestions = exercise.questions.filter(
      (q) => !answers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      const confirmSubmit = confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/exercises/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers
        })
      });

      if (!response.ok) throw new Error('Failed to submit exercise');

      const result = await response.json();

      toast({
        title: 'Exercise completed!',
        description: `Your score: ${result.score}/${result.totalScore}`,
        action: (
          <Button
            size="sm"
            onClick={() => router.push(`/exercises/${params.id}/results`)}
          >
            View Results
          </Button>
        )
      });

      router.push(`/exercises/${params.id}/results`);
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Could not submit your exercise. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    toast({
      title: "Time's up!",
      description: 'Your exercise is being submitted automatically.',
      variant: 'destructive'
    });
    handleSubmit();
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    handleSaveProgress(true);
  };

  if (exerciseError || sessionError) {
    return (
      <div className="flex-1 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load exercise. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!exercise || !session) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const question = exercise.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exercise.questions.length) * 100;
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === exercise.questions.length - 1;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{exercise.title}</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {exercise.questions.length}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          {timeRemaining !== null && (
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono font-medium ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePauseToggle}
                  disabled={isSubmitting}
                >
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </Button>
              </div>
            </Card>
          )}

          {/* Save Progress */}
          <Button
            variant="outline"
            onClick={() => handleSaveProgress()}
            disabled={isSaving || isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Progress'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{Math.round(progress)}% Complete</span>
          <span>
            {Object.keys(answers).length} of {exercise.questions.length} answered
          </span>
        </div>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Exercise paused. Click the play button to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Question Card */}
      {!isPaused && (
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestion + 1}
              {question.points > 1 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({question.points} points)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-base">{question.question}</div>

            <Separator />

            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {(question.options as Array<{id: string, text: string}>).map((option) => (
                <div key={option.id} className="flex items-start space-x-3 py-2">
                  <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                  <Label
                    htmlFor={`option-${option.id}`}
                    className="font-normal cursor-pointer flex-1"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          disabled={isFirstQuestion || isPaused}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {/* Question Indicators */}
          {exercise.questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(index)}
              disabled={isPaused}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-colors
                ${index === currentQuestion
                  ? 'bg-primary text-primary-foreground'
                  : answers[q.id]
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isPaused}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exercise'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={isPaused}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}