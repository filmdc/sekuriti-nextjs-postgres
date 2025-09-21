import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart
} from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getUserExerciseHistory, getUserStats } from '@/lib/db/queries-exercise-history';
import { ExerciseHistoryFilters } from '@/components/exercises/history-filters';
import { HistoryChart } from '@/components/exercises/history-chart';

async function ExerciseHistoryContent() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex-1 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to view your exercise history.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const history = await getUserExerciseHistory(session.user.id);
  const stats = await getUserStats(session.user.id);

  const completedExercises = history.filter(h => h.status === 'completed');
  const inProgressExercises = history.filter(h => h.status === 'in_progress');

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training History</h2>
          <p className="text-muted-foreground mt-2">
            Track your progress and review past exercises
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/exercises">
              Browse Exercises
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export History
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Total Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalInProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageScore)}%</div>
            <Progress value={stats.averageScore} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalTime)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Training completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Earned to date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Progress Over Time
          </CardTitle>
          <CardDescription>
            Your training activity and scores over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryChart data={stats.progressData} />
        </CardContent>
      </Card>

      {/* Exercise History Tabs */}
      <Tabs defaultValue="completed" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="secondary" className="ml-2">
                {completedExercises.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress
              <Badge variant="secondary" className="ml-2">
                {inProgressExercises.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
          </TabsList>
          <ExerciseHistoryFilters />
        </div>

        {/* Completed Exercises */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Exercises</CardTitle>
              <CardDescription>
                All exercises you've successfully completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedExercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No completed exercises yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/exercises">Start Training</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exercise</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Time Taken</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedExercises.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.exercise.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.exercise.category}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.exercise.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.score >= item.totalScore * 0.7 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={getScoreColor(item.score, item.totalScore)}>
                              {item.score}/{item.totalScore}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({Math.round((item.score / item.totalScore) * 100)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDuration(item.timeTaken)}
                        </TableCell>
                        <TableCell>
                          {new Date(item.completedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/exercises/${item.exerciseId}/results`}>
                                View Results
                              </Link>
                            </Button>
                            {item.certificateUrl && (
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* In Progress Exercises */}
        <TabsContent value="in_progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
              <CardDescription>
                Exercises you've started but haven't completed yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inProgressExercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No exercises in progress</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inProgressExercises.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{item.exercise.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Started {new Date(item.startedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{item.progress}% complete</span>
                        </div>
                        <Progress value={item.progress} className="h-2 w-48" />
                      </div>
                      <Button asChild>
                        <Link href={`/exercises/${item.exerciseId}/start`}>
                          Continue
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.categoryPerformance.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(category.averageScore)}%
                        </span>
                      </div>
                      <Progress value={category.averageScore} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.difficultyDistribution.map((level) => (
                    <div key={level.difficulty} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {level.difficulty}
                        </Badge>
                        <span className="text-sm">{level.count} exercises</span>
                      </div>
                      <span className="text-sm font-medium">
                        Avg: {Math.round(level.averageScore)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Path Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.learningPathProgress}%
                    </span>
                  </div>
                  <Progress value={stats.learningPathProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Complete more exercises to unlock advanced training modules
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ExerciseHistoryPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ExerciseHistoryContent />
    </Suspense>
  );
}