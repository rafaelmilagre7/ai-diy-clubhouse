
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ValidationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  validationMessage?: string;
  isValid: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const ValidationDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  validationMessage,
  isValid,
  confirmText = "Continuar",
  cancelText = "Cancelar"
}: ValidationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{description}</p>
            {validationMessage && (
              <div className={`p-3 rounded-lg border ${
                isValid 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <p className="text-sm font-medium">{validationMessage}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={isValid ? "" : "bg-amber-600 hover:bg-amber-700"}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
