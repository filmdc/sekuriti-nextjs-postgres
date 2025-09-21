export interface ExerciseOption {
  id: string;
  text: string;
}

export interface ExerciseQuestion {
  id: number;
  exerciseId: number;
  questionNumber: number;
  question: string;
  options: ExerciseOption[];
  correctAnswer: string;
  explanation: string | null;
  points: number | null;
}

export interface TabletopExercise {
  id: number;
  title: string;
  description: string | null;
  scenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number | null;
  category: string | null;
  objectives: string[] | null;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseWithQuestions extends TabletopExercise {
  questions: ExerciseQuestion[];
  totalPoints?: number;
  completionCount?: number;
  averageScore?: number;
  userStatus?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progress?: number;
    score?: number;
    totalScore?: number;
  };
}

export interface ExerciseCompletion {
  id: number;
  exerciseId: number;
  userId: number;
  organizationId: number;
  startedAt: Date;
  completedAt: Date | null;
  score: number;
  totalScore: number;
  answers: Record<number, string>;
  feedback: string | null;
  certificateUrl: string | null;
}

export interface ExerciseSession {
  id: string;
  exerciseId: number;
  userId: number;
  answers: Record<number, string>;
  currentQuestion: number;
  timeRemaining: number | null;
  startedAt: Date;
}

export interface ExerciseAnswer {
  questionId: number;
  answer: string;
  isCorrect?: boolean;
}

export interface ExerciseResult {
  exercise: TabletopExercise;
  completion: ExerciseCompletion;
  questions: ExerciseQuestion[];
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  passed: boolean;
  categoryBreakdown?: Array<{
    name: string;
    correct: number;
    total: number;
  }>;
  recommendations?: TabletopExercise[];
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  department: string;
  totalPoints: number;
  exercisesCompleted: number;
  averageScore: number;
  monthlyPoints: number;
  monthlyExercises: number;
  weeklyPoints: number;
  weeklyExercises: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TeamStats {
  activeMembersCount: number;
  averageScore: number;
  totalExercisesCompleted: number;
  currentStreak: number;
  achievements: {
    perfectScorer: {
      name: string;
      count: number;
    } | null;
    speedRunner: {
      name: string;
      time: number;
    } | null;
    mostDedicated: {
      name: string;
      streak: number;
    } | null;
  };
}

export interface UserProgress {
  completedCount: number;
  inProgressCount: number;
  averageScore: number;
  totalPoints: number;
  recommended: TabletopExercise[];
}

export interface UserStats {
  totalCompleted: number;
  totalInProgress: number;
  averageScore: number;
  totalTime: number;
  certificatesEarned: number;
  progressData: Array<{
    date: string;
    exercises: number;
    score: number;
  }>;
  categoryPerformance: Array<{
    name: string;
    averageScore: number;
    count: number;
  }>;
  difficultyDistribution: Array<{
    difficulty: string;
    count: number;
    averageScore: number;
  }>;
  learningPathProgress: number;
  recentAchievements: Array<{
    title: string;
    description: string;
  }>;
}