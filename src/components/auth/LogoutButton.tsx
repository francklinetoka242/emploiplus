import { useNavigate } from 'react-router-dom';
import { Button, ButtonProps } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

export interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean;
  text?: string;
}

export function LogoutButton({
  showIcon = true,
  text = 'Déconnexion',
  ...buttonProps
}: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Vous avez été déconnecté');
      navigate('/connexion');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur de déconnexion');
    }
  };

  return (
    <Button onClick={handleLogout} {...buttonProps}>
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {text}
    </Button>
  );
}
