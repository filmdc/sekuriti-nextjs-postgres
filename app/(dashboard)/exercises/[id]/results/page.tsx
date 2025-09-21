import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trophy,
  Award,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2,
  RefreshCw,
  Home,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { getExerciseResults } from '@/lib/db/queries-exercise-results';
import { auth } from '@/lib/auth';
import { QuestionResult } from '@/components/exercises/question-result';
import { CertificateCard } from '@/components/exercises/certificate-card';
import { ScoreChart } from '@/components/exercises/score-chart';

interface ExerciseResultsPageProps {
  params: {
    id: string;
  };
}

async function ExerciseResultsContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex-1 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to view exercise results.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const results = await getExerciseResults(session.user.id, parseInt(id));

  if (!results) {
    notFound();
  }

  const scorePercentage = Math.round((results.score / results.totalScore) * 100);
  const isPassing = scorePercentage >= 70;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 95) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (percentage >= 85) return { text: 'Great', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 70) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 50) return { text: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const scoreBadge = getScoreBadge(scorePercentage);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{results.exercise.title}</h1>
            <p className="text-muted-foreground mt-1">
              Completed on {new Date(results.completedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/exercises">
                <Home className="mr-2 h-4 w-4" />
                Back to Exercises
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/exercises/${id}/start`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake Exercise
              </Link>
            </Button>
          </div>
        </div>

        {/* Score Overview */}
        <Card className={isPassing ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {isPassing ? 'Congratulations!' : 'Keep Practicing!'}
                </CardTitle>
                <CardDescription>
                  {isPassing
                    ? "You've successfully completed this exercise."
                    : "You didn't pass this time, but you can try again!"}
                </CardDescription>
              </div>
              {isPassing && <Trophy className="h-12 w-12 text-yellow-500" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(scorePercentage)}`}>
                  {scorePercentage}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                <Badge className={`mt-2 ${scoreBadge.color}`}>{scoreBadge.text}</Badge>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold">
                  {results.score}/{results.totalScore}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Points Earned</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Correct Answers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate */}
        {isPassing && results.certificateUrl && (
          <CertificateCard
            certificateUrl={results.certificateUrl}
            userName={session.user.name || session.user.email}
            exerciseTitle={results.exercise.title}
            completedAt={results.completedAt}
            score={scorePercentage}
          />
        )}

        {/* Performance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
            <CardDescription>
              Detailed breakdown of your answers and learning opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Distribution Chart */}
            <ScoreChart
              correct={results.correctAnswers}
              incorrect={results.totalQuestions - results.correctAnswers}
              categories={results.categoryBreakdown}
            />

            <Separator />

            {/* Category Breakdown */}
            {results.categoryBreakdown && results.categoryBreakdown.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Performance by Category</h3>
                <div className="space-y-2">
                  {results.categoryBreakdown.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(category.correct / category.total) * 100}
                          className="w-32 h-2"
                        />
                        <span className="text-sm text-muted-foreground">
                          {category.correct}/{category.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>
              Review your answers and learn from the explanations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.questions.map((question, index) => (
              <QuestionResult
                key={question.id}
                question={question}
                userAnswer={results.answers[question.id]}
                isCorrect={results.answers[question.id] === question.correctAnswer}
                questionNumber={index + 1}
              />
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        {results.recommendations && results.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended Next Steps
              </CardTitle>
              <CardDescription>
                Based on your performance, we recommend these exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {results.recommendations.map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={`/exercises/${exercise.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{exercise.title}</p>
                      <p className="text-sm text-muted-foreground">{exercise.difficulty}</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" size="lg" asChild>
            <Link href="/exercises/history">
              View All History
            </Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/exercises">
              Browse More Exercises
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExerciseResultsPage({ params }: ExerciseResultsPageProps) {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ExerciseResultsContent id={params.id} />
    </Suspense>
  );
}