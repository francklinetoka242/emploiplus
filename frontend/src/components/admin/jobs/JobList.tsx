// src/components/admin/jobs/JobList.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye, EyeOff, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import ConfirmButton from '@/components/ConfirmButton';
import JobForm from "./JobForm";
import { JobData, api } from "@/lib/api";
import { authHeaders } from '@/lib/headers';

interface Job extends JobData {
  id: string;
  published: boolean;
  created_at: string;
  image_url?: string;
  deadline_date?: string;
}

interface JobListProps {
  jobs?: Job[];
}

export default function JobList({ jobs: initialJobs }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchJobs = async () => {
    try {
      // Use admin API endpoint for admin panel
      const res = await api.getAdminJobs();
      setJobs(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      toast.error("Erreur lors du chargement des offres");
    }
  };

  useEffect(() => {
    // If jobs are provided as props, use them; otherwise fetch from API
    if (!initialJobs || initialJobs.length === 0) {
      fetchJobs();
    } else {
      setJobs(initialJobs);
    }
  }, [initialJobs]);

  const togglePublish = async (id: string, published: boolean) => {
    try {
      await api.publishJob(id, !published);
      toast.success(published ? "Offre dépubliée" : "Offre publiée");
      fetchJobs();
    } catch (err) {
      console.error('Publish error:', err);
      toast.error("Échec de la mise à jour du statut");
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await api.deleteAdminJob(id);
      toast.success("Offre supprimée");
      fetchJobs();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const isDeadlinePassed = (deadlineDate: string | undefined) => {
    if (!deadlineDate) return false;
    return new Date(deadlineDate) < new Date();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {showForm || editingJob ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <JobForm job={editingJob} onSuccess={() => {
              setShowForm(false);
              setEditingJob(null);
              fetchJobs();
            }} />
          </div>
        </div>
      ) : null}

      {jobs.length === 0 ? (
        <Card className="p-20 text-center">
          <Briefcase className="h-24 w-24 mx-auto mb-6 text-gray-300" />
          <p className="text-xl text-muted-foreground">Aucune offre pour le moment</p>
        </Card>
      ) : (
        jobs.map((job: Job) => (
          <Card key={job.id} className="p-8 hover:shadow-lg transition">
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{job.title}</h3>
                <p className="text-lg text-muted-foreground">{job.company} • {job.location}</p>
                <p className="mt-4 line-clamp-2">{job.description}</p>
                <div className="flex gap-4 mt-4 text-sm flex-wrap">
                  <span className={`px-3 py-1 rounded-full ${job.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {job.published ? "Publiée" : "Brouillon"}
                  </span>
                  <span>{job.type}</span>
                  {job.sector && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">{job.sector}</span>}
                  <span>{job.salary || "Salaire non communiqué"}</span>
                  {job.application_email && (
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {job.application_email}
                    </span>
                  )}
                </div>
                
                {/* Deadline date display */}
                {job.deadline_date && (
                  <div className="mt-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className={isDeadlinePassed(job.deadline_date) ? "text-red-600 font-semibold" : "text-gray-700"}>
                      {isDeadlinePassed(job.deadline_date) ? "Date limite dépassée" : `Date limite: ${formatDate(job.deadline_date)}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => setEditingJob(job)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={job.published ? "default" : "outline"}
                  onClick={() => togglePublish(job.id, job.published)}
                >
                  {job.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <ConfirmButton title="Supprimer cette offre ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => deleteJob(job.id)}>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </ConfirmButton>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}