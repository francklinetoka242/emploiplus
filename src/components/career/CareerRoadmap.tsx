// src/components/career/CareerRoadmap.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle2, Circle, BookOpen, Share2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CareerRoadmapProps {
  jobId: number;
  jobTitle?: string;
}

export const CareerRoadmap = ({ jobId, jobTitle }: CareerRoadmapProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState<Record<number, boolean>>({});

  const { data: roadmap, isLoading, error } = useQuery({
    queryKey: ['careerRoadmap', jobId, user?.id],
    queryFn: () => api.generateCareerRoadmap(jobId),
    enabled: !!user?.id && !!jobId,
  });

  const handleShare = () => {
    const text = `Je vise le poste de "${roadmap?.targetJobTitle}". J'ai complété ${roadmap?.completionPercentage}% des compétences requises. Aidez-moi à finir ma progression de carrière!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Ma progression de carrière',
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Texte copié dans le presse-papiers');
    }
  };

  if (!user?.id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 bg-gradient-to-b from-blue-50 to-transparent rounded-lg">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return null;
  }

  const { acquiredSkills, missingSkills, completionPercentage, targetJobTitle } = roadmap;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            Votre Roadmap Carrière
          </h3>
          <p className="text-sm text-gray-600 mt-1">Vers: <span className="font-medium">{targetJobTitle}</span></p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-blue-600 hover:bg-blue-100"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Partager
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Vertical Stepper */}
      <div className="space-y-3">
        {/* Acquired Skills */}
        {acquiredSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Compétences Acquises ({acquiredSkills.length})
            </h4>
            <div className="space-y-1 ml-6">
              {acquiredSkills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
              <Circle className="w-4 h-4" />
              Compétences à Acquérir ({missingSkills.length})
            </h4>
            <div className="space-y-2 ml-6">
              {missingSkills.map((step, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Circle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{step.skill}</div>
                      <div className="text-xs text-gray-600">{step.category}</div>
                    </div>
                  </div>

                  {/* Suggested Formations */}
                  {step.suggestedFormations.length > 0 && (
                    <div className={`ml-6 space-y-1.5 transition-all duration-200 ${showDetails[idx] ? 'block' : 'hidden'}`}>
                      <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Formations Suggérées
                      </div>
                      <div className="space-y-1">
                        {step.suggestedFormations.slice(0, 3).map((formation, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => navigate(`/formations/${formation.id}`)}
                            className="text-xs p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 hover:border-blue-400 transition-colors w-full text-left"
                          >
                            <div className="font-medium text-blue-700">{formation.title}</div>
                            <div className="text-gray-600 text-xs mt-0.5">
                              {formation.level} • {formation.duration}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle Details */}
                  {step.suggestedFormations.length > 0 && (
                    <button
                      onClick={() => setShowDetails(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="text-xs text-blue-600 hover:underline ml-6 font-medium"
                    >
                      {showDetails[idx] ? '▼ Masquer' : '▶ En savoir plus'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      {missingSkills.length > 0 && (
        <Button
          onClick={() => navigate('/formations')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Explorez les Formations
        </Button>
      )}

      {completionPercentage === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm font-semibold text-green-700">
            ✓ Vous possédez toutes les compétences requises!
          </p>
        </div>
      )}
    </div>
  );
};
