'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'green' | 'red' | 'blue' | 'orange';
  action: () => void;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

const getActionColor = (color: SwipeAction['color']) => {
  switch (color) {
    case 'green':
      return 'bg-green-500 text-white';
    case 'red':
      return 'bg-red-500 text-white';
    case 'blue':
      return 'bg-blue-500 text-white';
    case 'orange':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
  disabled = false,
}: SwipeActionsProps) {
  const [startX, setStartX] = React.useState(0);
  const [currentX, setCurrentX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragDistance, setDragDistance] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;

    const touch = e.touches[0];
    setCurrentX(touch.clientX);
    const distance = touch.clientX - startX;

    // Limit drag distance
    const maxDistance = Math.min(leftActions.length * 80, rightActions.length * 80, 160);
    const limitedDistance = Math.max(-maxDistance, Math.min(maxDistance, distance));
    setDragDistance(limitedDistance);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;

    setIsDragging(false);
    setIsAnimating(true);

    const distance = currentX - startX;
    const absDistance = Math.abs(distance);

    if (absDistance > threshold) {
      // Trigger action
      if (distance > 0 && leftActions.length > 0) {
        // Swiped right - trigger left action
        const actionIndex = Math.min(
          Math.floor(distance / 80),
          leftActions.length - 1
        );
        leftActions[actionIndex]?.action();
      } else if (distance < 0 && rightActions.length > 0) {
        // Swiped left - trigger right action
        const actionIndex = Math.min(
          Math.floor(Math.abs(distance) / 80),
          rightActions.length - 1
        );
        rightActions[actionIndex]?.action();
      }
    }

    // Reset position
    setTimeout(() => {
      setDragDistance(0);
      setIsAnimating(false);
    }, 200);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;

    setCurrentX(e.clientX);
    const distance = e.clientX - startX;

    const maxDistance = Math.min(leftActions.length * 80, rightActions.length * 80, 160);
    const limitedDistance = Math.max(-maxDistance, Math.min(maxDistance, distance));
    setDragDistance(limitedDistance);
  };

  const handleMouseUp = () => {
    if (!isDragging || disabled) return;

    setIsDragging(false);
    setIsAnimating(true);

    const distance = currentX - startX;
    const absDistance = Math.abs(distance);

    if (absDistance > threshold) {
      if (distance > 0 && leftActions.length > 0) {
        const actionIndex = Math.min(
          Math.floor(distance / 80),
          leftActions.length - 1
        );
        leftActions[actionIndex]?.action();
      } else if (distance < 0 && rightActions.length > 0) {
        const actionIndex = Math.min(
          Math.floor(Math.abs(distance) / 80),
          rightActions.length - 1
        );
        rightActions[actionIndex]?.action();
      }
    }

    setTimeout(() => {
      setDragDistance(0);
      setIsAnimating(false);
    }, 200);
  };

  React.useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!isDragging) return;
      setCurrentX(e.clientX);
      const distance = e.clientX - startX;
      const maxDistance = Math.min(leftActions.length * 80, rightActions.length * 80, 160);
      const limitedDistance = Math.max(-maxDistance, Math.min(maxDistance, distance));
      setDragDistance(limitedDistance);
    };

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, startX, leftActions.length, rightActions.length]);

  const showLeftActions = dragDistance > 0;
  const showRightActions = dragDistance < 0;

  return (
    <div className={cn('relative overflow-hidden touch-pan-y', className)} ref={containerRef}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 h-full flex items-center">
          {leftActions.map((action, index) => (
            <Button
              key={action.id}
              size="sm"
              className={cn(
                'h-full rounded-none px-4 transition-all duration-200',
                getActionColor(action.color),
                showLeftActions ? 'opacity-100' : 'opacity-0'
              )}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
              }}
              style={{
                transform: `translateX(${Math.max(0, dragDistance - (index * 80))}px)`,
              }}
            >
              {action.icon}
              <span className="ml-1 text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 h-full flex items-center">
          {rightActions.map((action, index) => (
            <Button
              key={action.id}
              size="sm"
              className={cn(
                'h-full rounded-none px-4 transition-all duration-200',
                getActionColor(action.color),
                showRightActions ? 'opacity-100' : 'opacity-0'
              )}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
              }}
              style={{
                transform: `translateX(${Math.min(0, dragDistance + (index * 80))}px)`,
              }}
            >
              {action.icon}
              <span className="ml-1 text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          'relative bg-background transition-transform',
          isAnimating && 'duration-200 ease-out',
          isDragging && 'cursor-grabbing',
          !disabled && 'cursor-grab'
        )}
        style={{
          transform: `translateX(${dragDistance}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {children}
      </div>
    </div>
  );
}