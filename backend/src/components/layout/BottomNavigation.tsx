import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onLeftClick: () => void;
  onCenterClick: () => void;
  onRightClick: () => void;
  activeView: "left" | "center" | "right" | "full";
  leftLabel?: string;
  centerLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactNode;
  centerIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onLeftClick,
  onCenterClick,
  onRightClick,
  activeView,
  leftLabel = "Gauche",
  centerLabel = "Fil",
  rightLabel = "Droite",
  leftIcon,
  centerIcon,
  rightIcon,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {/* Bouton Gauche */}
        <Button
          onClick={onLeftClick}
          variant={activeView === "left" || activeView === "full" ? "default" : "ghost"}
          size="sm"
          className="flex flex-col gap-1 h-auto py-2 px-3"
        >
          {leftIcon || <Menu className="h-5 w-5" />}
          <span className="text-xs">{leftLabel}</span>
        </Button>

        {/* Bouton Centre */}
        <Button
          onClick={onCenterClick}
          variant={activeView === "center" || activeView === "full" ? "default" : "ghost"}
          size="sm"
          className="flex flex-col gap-1 h-auto py-2 px-3"
        >
          {centerIcon || <Eye className="h-5 w-5" />}
          <span className="text-xs">{centerLabel}</span>
        </Button>

        {/* Bouton Droite */}
        <Button
          onClick={onRightClick}
          variant={activeView === "right" || activeView === "full" ? "default" : "ghost"}
          size="sm"
          className="flex flex-col gap-1 h-auto py-2 px-3"
        >
          {rightIcon || <ChevronRight className="h-5 w-5" />}
          <span className="text-xs">{rightLabel}</span>
        </Button>
      </div>
    </div>
  );
};
