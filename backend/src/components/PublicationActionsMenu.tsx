/**
 * Composant PublicationActionsMenu
 * Menu déroulant avec actions pour les publications
 * Signaler, Masquer, Partager Via
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  AlertCircle, 
  EyeOff, 
  Share2 
} from "lucide-react";

interface PublicationActionsMenuProps {
  publicationId: number;
  publicationAuthorId: number;
}

export const PublicationActionsMenu: React.FC<PublicationActionsMenuProps> = ({
  publicationId,
  publicationAuthorId,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleReport = () => {
    setOpen(false);
    navigate(`/publication/${publicationId}/report`);
  };

  const handleHide = () => {
    setOpen(false);
    navigate(`/publication/${publicationId}/hide`);
  };

  const handleShare = () => {
    setOpen(false);
    navigate(`/publication/${publicationId}/share`);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
          title="Options de publication"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleReport} className="cursor-pointer flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span>Signaler</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleHide} className="cursor-pointer flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-amber-500" />
          <span>Masquer</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleShare} className="cursor-pointer flex items-center gap-2">
          <Share2 className="h-4 w-4 text-blue-500" />
          <span>Partager via</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
