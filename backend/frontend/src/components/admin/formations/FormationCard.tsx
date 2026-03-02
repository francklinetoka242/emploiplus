// src/components/admin/formations/FormationCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { FormationData } from "@/lib/api";

interface Formation extends FormationData {
  id: string;
  published: boolean;
  created_at: string;
  image_url?: string;
}

interface Props {
  formation: Formation;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export default function FormationCard({ formation, onEdit, onToggle, onDelete }: Props) {
  return (
    <Card className="p-8 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-blue-100 rounded-xl">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{formation.title}</h3>
            <p className="text-lg text-muted-foreground">{formation.category}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="font-medium">{formation.level}</span>
              <span>{formation.duration}</span>
              <span className="font-semibold">{formation.price ? `${formation.price} FCFA` : "Gratuit"}</span>
            </div>
            <p className="mt-4 line-clamp-2">{formation.description}</p>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-sm ${formation.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                {formation.published ? "Publiée" : "Brouillon"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
          <Button size="sm" variant={formation.published ? "default" : "outline"} onClick={onToggle}>
            {formation.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <ConfirmButton title="Supprimer cette formation ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={onDelete}>
            <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
          </ConfirmButton>
        </div>
      </div>
    </Card>
  );
}