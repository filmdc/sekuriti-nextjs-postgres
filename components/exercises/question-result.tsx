'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface QuestionResultProps {
  question: {
    id: number;
    question: string;
    options: any;
    correctAnswer: string;
    explanation: string | null;
    points: number | null;
  };
  userAnswer: string | null;
  isCorrect: boolean;
  questionNumber: number;
}

export function QuestionResult({ question, userAnswer, isCorrect, questionNumber }: QuestionResultProps) {
  const options = question.options as Array<{ id: string; text: string }>;
  const correctOption = options.find((o) => o.id === question.correctAnswer);
  const userOption = options.find((o) => o.id === userAnswer);

  return (
    <Card className={isCorrect ? 'border-green-200' : 'border-red-200'}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-semibold">
              Question {questionNumber}
              {question.points && question.points > 1 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({question.points} points)
                </span>
              )}
            </span>
          </div>
          <Badge variant={isCorrect ? 'default' : 'destructive'}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{question.question}</p>

        <div className="space-y-2">
          {options.map((option) => {
            const isUserAnswer = option.id === userAnswer;
            const isCorrectAnswer = option.id === question.correctAnswer;

            return (
              <div
                key={option.id}
                className={`p-3 rounded-lg text-sm ${
                  isCorrectAnswer
                    ? 'bg-green-50 border border-green-300'
                    : isUserAnswer && !isCorrect
                    ? 'bg-red-50 border border-red-300'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  {isCorrectAnswer && (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  )}
                  {isUserAnswer && !isCorrect && (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={isCorrectAnswer ? 'font-medium' : ''}>
                    {option.text}
                    {isUserAnswer && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Your answer
                      </Badge>
                    )}
                    {isCorrectAnswer && (
                      <Badge variant="outline" className="ml-2 text-xs bg-green-100">
                        Correct answer
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {question.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-blue-900 mb-1">Explanation</p>
                <p className="text-sm text-blue-800">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {!userAnswer && (
          <p className="text-sm text-muted-foreground italic">You didn't answer this question</p>
        )}
      </CardContent>
    </Card>
  );
}