'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ScoreChartProps {
  correct: number;
  incorrect: number;
  categories?: Array<{
    name: string;
    correct: number;
    total: number;
  }>;
}

export function ScoreChart({ correct, incorrect, categories }: ScoreChartProps) {
  const data = [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Incorrect', value: incorrect, color: '#ef4444' }
  ];

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {categories && categories.length > 0 && (
        <div className="grid gap-2">
          <p className="text-sm font-medium">Performance by Category:</p>
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-sm">
              <span className="capitalize">{cat.name.replace('_', ' ')}</span>
              <span className="font-medium">
                {cat.correct}/{cat.total} ({Math.round((cat.correct / cat.total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}