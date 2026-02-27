// src/components/admin/common/PageHeader.tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function PageHeader({ title, buttonText, onButtonClick }: Props) {
  return (
    <div className="flex justify-between items-center mb-10 border-b pb-6">
      <h1 className="text-4xl font-bold">{title}</h1>
      {buttonText && (
        <Button onClick={onButtonClick} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {buttonText}
        </Button>
      )}
    </div>
  );
}