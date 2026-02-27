// src/components/admin/jobs/JobList.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmButton from '@/components/ConfirmButton';
import JobForm from "./JobForm";
import { JobData } from "@/lib/api";

interface Job extends JobData {
  id: string;
  published: boolean;
  created_at: string;
  image_url?: string;
}

interface JobListProps {
  jobs?: Job[];
}

export default function JobList({ jobs: initialJobs }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchJobs = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
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
    await fetch(`/api/jobs/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    toast.success(published ? "Offre dépubliée" : "Offre publiée");
    fetchJobs();
  };

  const deleteJob = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    toast.success("Offre supprimée");
    fetchJobs();
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
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{job.title}</h3>
                <p className="text-lg text-muted-foreground">{job.company} • {job.location}</p>
                <p className="mt-4">{job.description.substring(0, 200)}...</p>
                <div className="flex gap-4 mt-4 text-sm">
                  <span className={`px-3 py-1 rounded-full ${job.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {job.published ? "Publiée" : "Brouillon"}
                  </span>
                  <span>{job.type}</span>
                  {job.sector && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">{job.sector}</span>}
                  <span>{job.salary || "Salaire non communiqué"}</span>
                </div>
              </div>
              <div className="flex gap-3">
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