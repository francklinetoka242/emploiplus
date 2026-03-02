// src/components/jobs/MatchScoreBadge.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface MatchScoreBadgeProps {
  jobId: number;
  className?: string;
}

export const MatchScoreBadge = ({ jobId, className = '' }: MatchScoreBadgeProps) => {
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(true);

  const { data: matchScore, isLoading } = useQuery({
    queryKey: ['matchScore', jobId, user?.id],
    queryFn: () => api.getMatchScore(jobId),
    enabled: !!user?.id && !!jobId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Stop animation after 2 seconds
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!user?.id || !matchScore) {
    return null;
  }

  const colorMap = {
    green: '#22c55e',
    orange: '#f59e0b',
    gray: '#94a3b8',
  };

  const bgColorMap = {
    green: 'bg-green-50',
    orange: 'bg-amber-50',
    gray: 'bg-slate-50',
  };

  const textColorMap = {
    green: 'text-green-700',
    orange: 'text-amber-700',
    gray: 'text-slate-700',
  };

  const borderColorMap = {
    green: 'border-green-200',
    orange: 'border-amber-200',
    gray: 'border-slate-200',
  };

  const color = matchScore.color;
  const score = matchScore.score;

  return (
    <div
      className={`relative w-16 h-16 ${className}`}
      title={`Match score: ${score}%`}
    >
      <svg
        className="absolute inset-0 transform -rotate-90"
        width="64"
        height="64"
        viewBox="0 0 64 64"
      >
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="2"
          opacity="0.2"
        />
        {/* Progress circle */}
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="2"
          strokeDasharray={`${2 * Math.PI * 28}`}
          strokeDashoffset={isAnimating ? `${2 * Math.PI * 28}` : `${2 * Math.PI * 28 * (1 - score / 100)}`}
          strokeLinecap="round"
          style={{
            transition: isAnimating ? 'stroke-dashoffset 2s ease-out' : 'none',
          }}
        />
      </svg>

      {/* Center text */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${bgColorMap[color]} border ${borderColorMap[color]} rounded-full`}
      >
        <div className={`${textColorMap[color]} font-bold text-sm`}>
          {isLoading ? '...' : `${score}%`}
        </div>
        <div className={`${textColorMap[color]} text-xs`}>Match</div>
      </div>
    </div>
  );
};
