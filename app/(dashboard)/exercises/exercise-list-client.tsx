'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';
import { importExercisesAction } from '@/lib/actions/data-import';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface ExerciseListClientProps {
  exercises: any[];
}

export function ExerciseListClient({ exercises }: ExerciseListClientProps) {
  const router = useRouter();

  const handleImport = async (data: any[], format: 'csv' | 'json' | 'excel') => {
    try {
      const result = await importExercisesAction(data, format);

      if (result.success > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.success} exercises${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        });
        router.refresh();
      }

      if (result.failed > 0 && result.errors) {
        const errorMessages = result.errors.slice(0, 3).map(e => e.error).join(', ');
        toast({
          title: 'Import Partially Failed',
          description: `${result.failed} exercises failed to import: ${errorMessages}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import exercises',
        variant: 'destructive'
      });
    }
  };

  const validateExerciseRow = (row: any) => {
    const errors = [];

    if (!row.title && !row.Title) {
      errors.push('Title is required');
    }

    const validTypes = ['tabletop', 'simulation', 'drill', 'workshop'];
    const type = (row.type || row.Type || '').toLowerCase();
    if (type && !validTypes.includes(type)) {
      errors.push(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    const validStatuses = ['draft', 'published', 'scheduled', 'completed', 'archived'];
    const status = (row.status || row.Status || '').toLowerCase();
    if (status && !validStatuses.includes(status)) {
      errors.push(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    const difficulty = (row.difficulty || row.Difficulty || '').toLowerCase();
    if (difficulty && !validDifficulties.includes(difficulty)) {
      errors.push(`Invalid difficulty: ${difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  const exportData = exercises.map((exercise) => ({
    id: exercise.id,
    title: exercise.title,
    description: exercise.description || '',
    type: exercise.type || 'tabletop',
    status: exercise.status || 'draft',
    difficulty: exercise.difficulty || 'intermediate',
    duration: exercise.duration || 60,
    maxParticipants: exercise.maxParticipants || 10,
    completionCount: exercise.completionCount || 0,
    averageScore: exercise.averageScore || 0,
    lastCompletedAt: exercise.lastCompletedAt ? new Date(exercise.lastCompletedAt).toISOString() : '',
    createdAt: new Date(exercise.createdAt).toISOString(),
    updatedAt: new Date(exercise.updatedAt).toISOString()
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`exercises-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description' },
          { key: 'type', label: 'Type' },
          { key: 'status', label: 'Status' },
          { key: 'difficulty', label: 'Difficulty' },
          { key: 'duration', label: 'Duration (min)' },
          { key: 'maxParticipants', label: 'Max Participants' },
          { key: 'completionCount', label: 'Completions' },
          { key: 'averageScore', label: 'Avg Score' },
          { key: 'lastCompletedAt', label: 'Last Completed' }
        ]}
        entityName="Exercises"
        templateColumns={[
          { key: 'title', label: 'Title', required: true, type: 'string', example: 'Ransomware Response Tabletop' },
          { key: 'description', label: 'Description', type: 'string', example: 'Practice responding to ransomware attacks' },
          { key: 'type', label: 'Type', type: 'string', example: 'tabletop, simulation, drill, workshop' },
          { key: 'status', label: 'Status', type: 'string', example: 'draft, published, scheduled, completed, archived' },
          { key: 'difficulty', label: 'Difficulty', type: 'string', example: 'beginner, intermediate, advanced, expert' },
          { key: 'duration', label: 'Duration (min)', type: 'number', example: '120' },
          { key: 'maxParticipants', label: 'Max Participants', type: 'number', example: '15' }
        ]}
        onImport={handleImport}
        validateRow={validateExerciseRow}
        maxRows={500}
      />
    </div>
  );
}