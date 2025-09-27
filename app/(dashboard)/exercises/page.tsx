import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Trophy,
  Clock,
  Target,
  ChevronRight,
  Shield,
  AlertTriangle,
  Bug,
  Lock,
  Users,
  Network,
  Brain,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { getExercises } from '@/lib/db/queries-exercises';
import { ExerciseCard } from '@/components/exercises/exercise-card';
import { ExerciseFilters } from '@/components/exercises/exercise-filters';
import { getUserProgress } from '@/lib/db/queries-exercise-progress';
import { auth } from '@/lib/auth';
import { ExerciseListClient } from './exercise-list-client';

// Category icons mapping
const categoryIcons = {
  malware: Bug,
  phishing: AlertTriangle,
  data_breach: Lock,
  ddos: Network,
  insider_threat: Users,
  ransomware: Shield,
  social_engineering: Brain,
  other: Target
};

async function ExercisesContent() {
  const session = await auth();
  const exercises = await getExercises();
  const userProgress = session?.user?.id ? await getUserProgress(session.user.id) : null;

  // Group exercises by difficulty
  const beginnerExercises = exercises.filter(e => e.difficulty === 'beginner');
  const intermediateExercises = exercises.filter(e => e.difficulty === 'intermediate');
  const advancedExercises = exercises.filter(e => e.difficulty === 'advanced');

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training Exercises</h2>
          <p className="text-muted-foreground mt-2">
            Practice incident response scenarios and improve your team's readiness
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/exercises/history">
              <Clock className="mr-2 h-4 w-4" />
              My History
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/exercises/leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Data Management Controls */}
      <ExerciseListClient exercises={exercises} />

      {/* Progress Overview */}
      {userProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{userProgress.completedCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{userProgress.inProgressCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{userProgress.averageScore}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{userProgress.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Exercises */}
      {userProgress?.recommended && userProgress.recommended.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>Based on your role and recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userProgress.recommended.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Tabs by Difficulty */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Exercises</TabsTrigger>
            <TabsTrigger value="beginner">
              Beginner
              <Badge variant="secondary" className="ml-2">
                {beginnerExercises.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="intermediate">
              Intermediate
              <Badge variant="secondary" className="ml-2">
                {intermediateExercises.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="advanced">
              Advanced
              <Badge variant="secondary" className="ml-2">
                {advancedExercises.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <ExerciseFilters />
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="beginner" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {beginnerExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intermediate" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {intermediateExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {advancedExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <ExercisesContent />
    </Suspense>
  );
}