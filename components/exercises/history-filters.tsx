'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export function ExerciseHistoryFilters() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [status, setStatus] = useState<string>('all');

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, yyyy')
              )
            ) : (
              'Date Range'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="passed">Passed (70%+)</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={() => {
        setDateRange(undefined);
        setStatus('all');
      }}>
        Clear Filters
      </Button>
    </div>
  );
}