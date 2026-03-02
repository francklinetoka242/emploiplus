import React from "react";
import * as LucideIcons from 'lucide-react';

type IconProps = {
  name: string;
  size?: number;
  className?: string;
};

export const Icon: React.FC<IconProps> = ({ name, size = 18, className = '' }) => {
  // Try to find the icon component in lucide-react exports
  // Fallback to 'Star' if not found
  const Comp = (LucideIcons as any)[name] || (LucideIcons as any)['Star'];
  if (!Comp) return null;
  return <Comp size={size} className={className} />;
};

export default Icon;
