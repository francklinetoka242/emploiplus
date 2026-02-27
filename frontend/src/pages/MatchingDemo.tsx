// src/pages/MatchingDemo.tsx
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'react-router-dom';
import { MatchScoreBadge } from '@/components/jobs/MatchScoreBadge';
import { CareerRoadmap } from '@/components/career/CareerRoadmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Briefcase, MapPin, DollarSign, Loader } from 'lucide-react';

export function MatchingDemo() {
  const { user } = useAuth();
  const [jobId, setJobId] = React.useState<number | null>(null);

  // Get first 10 jobs for selection
  const { data: jobsData } = useQuery({
    queryKey: ['jobsForMatching'],
    queryFn: () =>
      api.getJobs({
        q: '',
        location: '',
        company: '',
        sector: '',
        type: '',
        page: 1,
      }),
  });

  const jobs = jobsData?.data || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-bold">Login Required</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please login to see Match Score and Career Roadmap features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-5xl">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Match Score & Career Roadmap Demo
          </h1>
          <p className="text-lg text-gray-600">
            Select a job to see your compatibility score and career progression roadmap
          </p>
        </div>

        {/* Job Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Job</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 12).map((job: any) => (
              <button
                key={job.id}
                onClick={() => setJobId(job.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  jobId === job.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display Selected Job with Match Score */}
        {jobId && (
          <div className="space-y-8">
            <SelectedJobDisplay jobId={jobId} />
          </div>
        )}

        {/* Help Text */}
        {!jobId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-gray-700">
              👆 Select a job above to see your compatibility score and personalized career roadmap
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectedJobDisplay({ jobId }: { jobId: number }) {
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiUrl}/api/jobs/${jobId}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <>
      {/* Job Header */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">{job.title}</h2>
              <p className="text-blue-100 mt-2">{job.company}</p>
            </div>
            <div className="flex-shrink-0">
              <MatchScoreBadge jobId={jobId} className="w-20 h-20" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {job.location && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                <p className="text-gray-900 font-medium mt-1">{job.location}</p>
              </div>
            )}
            {job.type && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                <p className="text-gray-900 font-medium mt-1">{job.type}</p>
              </div>
            )}
            {job.salary && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Salary</p>
                <p className="text-gray-900 font-medium mt-1">{job.salary}</p>
              </div>
            )}
            {job.sector && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Sector</p>
                <p className="text-gray-900 font-medium mt-1">{job.sector}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {job.description && (
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-bold">Job Description</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap line-clamp-[20]">
              {job.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Career Roadmap */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Career Path</h3>
        <CareerRoadmap jobId={jobId} jobTitle={job.title} />
      </div>
    </>
  );
}

import React from 'react';
