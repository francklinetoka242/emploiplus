import { useState, useEffect } from 'react';
import { BookmarkPlus, Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { authHeaders } from '@/lib/headers';

interface SaveJobButtonProps {
  jobId: number | string;
  className?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function SaveJobButton({ jobId, className = "" }: SaveJobButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem('token');

  // Check if job is saved on mount
  useEffect(() => {
    if (user && token) {
      checkIfSaved();
    }
  }, [jobId, user, token]);

  const checkIfSaved = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/saved-jobs/check/${jobId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setSaved(data.saved || false);
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const toggleSaveJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Veuillez vous connecter pour enregistrer une offre');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        // Remove from saved
        const res = await fetch(`${API_BASE_URL}/api/saved-jobs/${jobId}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        
        if (res.ok) {
          setSaved(false);
          toast.success('Offre supprimée des favoris');
        } else {
          toast.error('Erreur lors de la suppression');
        }
      } else {
        // Save job
        const res = await fetch(`${API_BASE_URL}/api/saved-jobs`, {
          method: 'POST',
          headers: authHeaders('application/json'),
          body: JSON.stringify({ job_id: jobId })
        });
        
        if (res.ok) {
          setSaved(true);
          toast.success('Offre enregistrée');
        } else {
          toast.error('Erreur lors de l\'enregistrement');
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleSaveJob}
      disabled={loading}
      className={`p-2 rounded-lg transition ${
        saved
          ? 'bg-primary/20 text-primary hover:bg-primary/30'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={saved ? 'Supprimer des favoris' : 'Enregistrer cette offre'}
    >
      {saved ? (
        <Bookmark className="h-5 w-5 fill-current" />
      ) : (
        <BookmarkPlus className="h-5 w-5" />
      )}
    </button>
  );
}
