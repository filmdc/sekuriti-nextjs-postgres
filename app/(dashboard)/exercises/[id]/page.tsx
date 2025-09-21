import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  BookOpen,
  Clock,
  Target,
  Trophy,
  ChevronRight,
  ArrowLeft,
  Play,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { getExerciseById, getExerciseStats } from '@/lib/db/queries-exercises';
import { getUserExerciseStatus } from '@/lib/db/queries-exercise-progress';
import { auth } from '@/lib/auth';

interface ExercisePageProps {
  params: {
    id: string;
  };
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const difficultyDescriptions = {
  beginner: 'Suitable for new team members learning the basics',
  intermediate: 'For experienced members ready for complex scenarios',
  advanced: 'Challenging scenarios for incident response experts'
};

async function ExerciseDetailContent({ id }: { id: string }) {
  const session = await auth();
  const exercise = await getExerciseById(parseInt(id));

  if (!exercise) {
    notFound();
  }

  const stats = await getExerciseStats(exercise.id);
  const userStatus = session?.user?.id
    ? await getUserExerciseStatus(session.user.id, exercise.id)
    : null;

  const objectives = exercise.objectives as string[] || [];
  const breadcrumbItems = [
    { label: 'Training', href: '/exercises', icon: GraduationCap },
    { label: exercise.title }
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/exercises">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exercises
        </Link>
      </Button>

      {/* Exercise Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{exercise.title}</h1>
            <div className="flex items-center gap-4">
              <Badge className={difficultyColors[exercise.difficulty as keyof typeof difficultyColors]}>
                {exercise.difficulty}
              </Badge>
              {exercise.category && (
                <Badge variant="outline">{exercise.category}</Badge>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {exercise.estimatedDuration} minutes
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-1 h-3 w-3" />
                {stats.completionCount} completed
              </div>
            </div>
          </div>

          {/* User Status */}
          {userStatus && (
            <Card className="w-64">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {userStatus.status === 'completed' ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score: {userStatus.score}/{userStatus.totalScore} ({Math.round((userStatus.score / userStatus.totalScore) * 100)}%)
                    </div>
                    <Button size="sm" variant="outline" asChild className="w-full">
                      <Link href={`/exercises/${id}/results`}>View Results</Link>
                    </Button>
                  </>
                ) : userStatus.status === 'in_progress' ? (
                  <>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <Progress value={userStatus.progress} className="h-2" />
                    <Button size="sm" asChild className="w-full">
                      <Link href={`/exercises/${id}/start`}>Continue</Link>
                    </Button>
                  </>
                ) : (
                  <Button size="sm" asChild className="w-full">
                    <Link href={`/exercises/${id}/start`}>
                      <Play className="mr-2 h-3 w-3" />
                      Start Exercise
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{exercise.description}</p>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Scenario</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{exercise.scenario}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        {objectives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Exercise Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Difficulty Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{exercise.difficulty}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {difficultyDescriptions[exercise.difficulty as keyof typeof difficultyDescriptions]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageScore ? `${Math.round(stats.averageScore)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {stats.completionCount} completions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.successRate ? `${Math.round(stats.successRate)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pass rate (70% or higher)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {exercise.questions?.length || 0} questions • {exercise.totalPoints || 0} total points
          </div>

          {!userStatus || userStatus.status === 'not_started' ? (
            <Button size="lg" asChild>
              <Link href={`/exercises/${id}/start`}>
                <Play className="mr-2 h-4 w-4" />
                Start Exercise
              </Link>
            </Button>
          ) : userStatus.status === 'in_progress' ? (
            <Button size="lg" asChild>
              <Link href={`/exercises/${id}/start`}>
                Continue Exercise
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="lg" variant="outline" asChild>
                <Link href={`/exercises/${id}/results`}>
                  <Trophy className="mr-2 h-4 w-4" />
                  View Results
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link href={`/exercises/${id}/start`}>
                  Retake Exercise
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExercisePage({ params }: ExercisePageProps) {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ExerciseDetailContent id={params.id} />
    </Suspense>
  );
}