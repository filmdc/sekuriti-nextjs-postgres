import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Star,
  Target,
  Zap,
  Calendar,
  Users
} from 'lucide-react';
import { getLeaderboard, getTeamStats } from '@/lib/db/queries-exercise-leaderboard';
import { auth } from '@/lib/auth';

async function LeaderboardContent() {
  const session = await auth();
  const leaderboard = await getLeaderboard();
  const teamStats = await getTeamStats();

  const currentUserId = session?.user?.id;

  // Get top 3 for podium display
  const topThree = leaderboard.slice(0, 3);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return '';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground mt-2">
            See how you rank against your team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="py-1.5 px-3">
            <Calendar className="mr-1 h-3 w-3" />
            This Month
          </Badge>
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeMembersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Team Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(teamStats.averageScore)}%</div>
            <Progress value={teamStats.averageScore} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Exercises Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalExercisesCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Team total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Team activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Podium */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>This month's champions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {topThree.map((user, index) => (
              <div
                key={user.id}
                className={`relative p-4 rounded-lg border-2 ${
                  getRankColor(index + 1) || 'border-gray-200'
                }`}
              >
                <div className="absolute -top-3 -right-3">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {user.id === currentUserId ? 'You' : user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{user.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{user.exercisesCompleted}</p>
                      <p className="text-xs text-muted-foreground">Exercises</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{Math.round(user.averageScore)}%</p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Rankings</CardTitle>
              <CardDescription>All team members ranked by total points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.id === currentUserId ? 'bg-primary/5 border border-primary/20' : ''
                    } ${index < 3 ? getRankColor(index + 1) : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        <span className="font-bold text-lg">#{index + 1}</span>
                        {getTrendIcon(user.trend)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.id === currentUserId ? 'You' : user.name}
                          {index < 3 && getRankIcon(index + 1)}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-semibold">{user.totalPoints}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{user.exercisesCompleted}</p>
                        <p className="text-xs text-muted-foreground">exercises</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Math.round(user.averageScore)}%</p>
                        <p className="text-xs text-muted-foreground">avg score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Rankings</CardTitle>
              <CardDescription>Performance for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.filter(u => u.monthlyPoints > 0).map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.id === currentUserId ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg w-8">#{index + 1}</span>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.id === currentUserId ? 'You' : user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{user.monthlyPoints}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{user.monthlyExercises}</p>
                        <p className="text-xs text-muted-foreground">exercises</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Rankings</CardTitle>
              <CardDescription>Performance for the current week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.filter(u => u.weeklyPoints > 0).map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.id === currentUserId ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg w-8">#{index + 1}</span>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.id === currentUserId ? 'You' : user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{user.weeklyPoints}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{user.weeklyExercises}</p>
                        <p className="text-xs text-muted-foreground">exercises</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Achievement categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Perfect Scorer
                </CardTitle>
                <CardDescription>Most 100% scores</CardDescription>
              </CardHeader>
              <CardContent>
                {teamStats.achievements.perfectScorer && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {teamStats.achievements.perfectScorer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{teamStats.achievements.perfectScorer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teamStats.achievements.perfectScorer.count} perfect scores
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Speed Runner
                </CardTitle>
                <CardDescription>Fastest average completion</CardDescription>
              </CardHeader>
              <CardContent>
                {teamStats.achievements.speedRunner && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {teamStats.achievements.speedRunner.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{teamStats.achievements.speedRunner.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: {teamStats.achievements.speedRunner.time}min
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-green-500" />
                  Most Dedicated
                </CardTitle>
                <CardDescription>Longest learning streak</CardDescription>
              </CardHeader>
              <CardContent>
                {teamStats.achievements.mostDedicated && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {teamStats.achievements.mostDedicated.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{teamStats.achievements.mostDedicated.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teamStats.achievements.mostDedicated.streak} day streak
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LeaderboardPage() {
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
      <LeaderboardContent />
    </Suspense>
  );
}