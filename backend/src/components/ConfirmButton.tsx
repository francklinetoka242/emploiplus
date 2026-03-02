import React from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type ConfirmButtonProps = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  children: React.ReactElement;
  confirmVariant?: 'destructive' | 'default' | 'outline' | undefined;
};

export default function ConfirmButton({
  title = 'Êtes-vous sûr ?',
  description,
  confirmLabel = 'Confirmer',
  onConfirm,
  children,
  confirmVariant,
}: ConfirmButtonProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Confirm action error', err);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        <div className="flex gap-2 justify-end mt-4">
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} variant={confirmVariant}>{confirmLabel}</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
