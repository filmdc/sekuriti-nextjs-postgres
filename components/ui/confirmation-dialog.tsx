'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/loading-spinner';
import { AlertTriangle, Trash2, Archive, LogOut, Shield } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'default';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  icon
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: icon || <Trash2 className="h-5 w-5 text-destructive" />,
          confirmVariant: 'destructive' as const
        };
      case 'warning':
        return {
          icon: icon || <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          confirmVariant: 'outline' as const
        };
      default:
        return {
          icon: icon || <Shield className="h-5 w-5 text-primary" />,
          confirmVariant: 'default' as const
        };
    }
  };

  const { icon: defaultIcon, confirmVariant } = getVariantStyles();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            {defaultIcon}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={confirmVariant}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading && <InlineSpinner className="mr-2" />}
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Predefined confirmation dialogs for common actions
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  isLoading?: boolean;
}) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Item"
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      variant="destructive"
      isLoading={isLoading}
    />
  );
}

function ArchiveConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  isLoading?: boolean;
}) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Archive Item"
      description={`Are you sure you want to archive "${itemName}"? You can restore it later from the archived items.`}
      confirmText="Archive"
      variant="warning"
      isLoading={isLoading}
      icon={<Archive className="h-5 w-5 text-yellow-500" />}
    />
  );
}

function LogoutConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sign Out"
      description="Are you sure you want to sign out? You'll need to sign in again to access your account."
      confirmText="Sign Out"
      variant="default"
      isLoading={isLoading}
      icon={<LogOut className="h-5 w-5 text-primary" />}
    />
  );
}

export {
  ConfirmationDialog,
  DeleteConfirmationDialog,
  ArchiveConfirmationDialog,
  LogoutConfirmationDialog
};