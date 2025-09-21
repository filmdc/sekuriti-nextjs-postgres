'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Users,
  Trophy,
  ChevronRight,
  PlayCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ExerciseCardProps {
  exercise: {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    difficulty: string;
    estimatedDuration: number | null;
    completionCount?: number;
    averageScore?: number;
    userStatus?: {
      status: 'not_started' | 'in_progress' | 'completed';
      progress?: number;
      score?: number;
      totalScore?: number;
    };
  };
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const categoryIcons: { [key: string]: React.ReactNode } = {
  malware: '🦠',
  phishing: '🎣',
  data_breach: '🔓',
  ddos: '🌊',
  insider_threat: '👤',
  ransomware: '🔒',
  social_engineering: '🧠',
  other: '🔍'
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const difficultyColor = difficultyColors[exercise.difficulty as keyof typeof difficultyColors] || '';
  const categoryIcon = exercise.category ? categoryIcons[exercise.category] || '📋' : '📋';

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">{categoryIcon}</span>
              <span className="line-clamp-1">{exercise.title}</span>
            </CardTitle>
            {exercise.description && (
              <CardDescription className="line-clamp-2">
                {exercise.description}
              </CardDescription>
            )}
          </div>
          {exercise.userStatus?.status === 'completed' && (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
          {exercise.userStatus?.status === 'in_progress' && (
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tags and Info */}
        <div className="flex flex-wrap gap-2">
          <Badge className={difficultyColor}>
            {exercise.difficulty}
          </Badge>
          {exercise.category && (
            <Badge variant="outline">{exercise.category.replace('_', ' ')}</Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{exercise.estimatedDuration || 30} min</span>
          </div>
          {exercise.completionCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{exercise.completionCount} completed</span>
            </div>
          )}
          {exercise.averageScore !== undefined && (
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>{Math.round(exercise.averageScore)}% avg</span>
            </div>
          )}
        </div>

        {/* User Progress */}
        {exercise.userStatus && exercise.userStatus.status === 'in_progress' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{exercise.userStatus.progress}%</span>
            </div>
            <Progress value={exercise.userStatus.progress} className="h-2" />
          </div>
        )}

        {exercise.userStatus && exercise.userStatus.status === 'completed' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Score</span>
            <span className="font-medium">
              {exercise.userStatus.score}/{exercise.userStatus.totalScore}
              ({Math.round((exercise.userStatus.score! / exercise.userStatus.totalScore!) * 100)}%)
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full" variant={exercise.userStatus?.status === 'completed' ? 'outline' : 'default'}>
          <Link href={`/exercises/${exercise.id}`}>
            {exercise.userStatus?.status === 'completed' ? (
              <>
                View Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : exercise.userStatus?.status === 'in_progress' ? (
              <>
                Continue Exercise
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Exercise
              </>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}