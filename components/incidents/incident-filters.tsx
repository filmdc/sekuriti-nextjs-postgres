'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export function IncidentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    startTransition(() => {
      router.push(`/incidents?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const params = new URLSearchParams(searchParams);

    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    startTransition(() => {
      router.push(`/incidents?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <form onSubmit={handleSearch}>
            <Input
              name="search"
              placeholder="Search incidents..."
              className="pl-10"
              defaultValue={searchParams.get('search') || ''}
              disabled={isPending}
            />
          </form>
        </div>
      </div>
      <div className="flex gap-2">
        <select
          name="status"
          className="px-3 py-2 border rounded-md text-sm"
          defaultValue={searchParams.get('status') || ''}
          onChange={handleFilterChange}
          disabled={isPending}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="contained">Contained</option>
          <option value="eradicated">Eradicated</option>
          <option value="recovered">Recovered</option>
          <option value="closed">Closed</option>
        </select>
        <select
          name="severity"
          className="px-3 py-2 border rounded-md text-sm"
          defaultValue={searchParams.get('severity') || ''}
          onChange={handleFilterChange}
          disabled={isPending}
        >
          <option value="">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>
  );
}