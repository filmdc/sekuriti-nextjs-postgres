'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StepTimerProps {
  estimatedDuration: number; // in minutes
  startedAt?: Date;
  isActive: boolean;
  isPaused: boolean;
  onTogglePause?: () => void;
  variant?: 'default' | 'compact';
}

export function StepTimer({
  estimatedDuration,
  startedAt,
  isActive,
  isPaused,
  onTogglePause,
  variant = 'default',
}: StepTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive || !startedAt || isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startedAt.getTime()) / 1000);
      setElapsed(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startedAt, isPaused]);

  useEffect(() => {
    if (startedAt && !isPaused) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startedAt.getTime()) / 1000);
      setElapsed(elapsedSeconds);
    }
  }, [startedAt, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const elapsedMinutes = Math.floor(elapsed / 60);
  const isOvertime = elapsedMinutes > estimatedDuration;
  const progressPercentage = Math.min((elapsedMinutes / estimatedDuration) * 100, 100);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-3 w-3" />
        <span className={`font-mono ${isOvertime ? 'text-red-500' : ''}`}>
          {formatTime(elapsed)}
        </span>
        {isActive && (
          <Badge variant={isOvertime ? 'destructive' : 'secondary'} className="text-xs">
            {isOvertime ? `+${elapsedMinutes - estimatedDuration}m` : `${estimatedDuration}m est`}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Step Timer</span>
        </div>
        {isActive && onTogglePause && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePause}
            className="h-7 px-2"
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-mono text-lg ${isOvertime ? 'text-red-500' : ''}`}>
            {formatTime(elapsed)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Est: {estimatedDuration}m
            </span>
            {isOvertime && (
              <Badge variant="destructive" className="text-xs">
                Over by {elapsedMinutes - estimatedDuration}m
              </Badge>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOvertime
                ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                : 'bg-primary'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
          {isOvertime && (
            <div
              className="h-2 bg-red-500 rounded-full -mt-2"
              style={{
                width: `${Math.min(((elapsedMinutes - estimatedDuration) / estimatedDuration) * 100, 100)}%`,
                marginLeft: '100%',
              }}
            />
          )}
        </div>

        {isPaused && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded">
            <Pause className="h-3 w-3" />
            Timer paused
          </div>
        )}
      </div>
    </div>
  );
}