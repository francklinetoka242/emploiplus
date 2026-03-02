// src/components/admin/jobs/JobCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye, EyeOff, Edit, Trash2 } from "lucide-react";

import { JobData } from "@/lib/api";

interface Job extends JobData {
  id: string;
  published: boolean;
  created_at: string;
}

interface JobCardProps {
  job: Job;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}

export default function JobCard({ job, onEdit, onTogglePublish, onDelete }: JobCardProps) {
  return (
    <Card className="p-8 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-primary/10 rounded-xl">
            <Briefcase className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{job.title}</h3>
            <p className="text-lg text-muted-foreground">{job.company} • {job.location}</p>
            <p className="mt-4 line-clamp-3">{job.description}</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className={`px-3 py-1 rounded-full ${job.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                {job.published ? "Publiée" : "Brouillon"}
              </span>
              <span>{job.type}</span>
              <span>{job.salary || "Salaire non communiqué"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={job.published ? "default" : "outline"}
            onClick={onTogglePublish}
          >
            {job.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}