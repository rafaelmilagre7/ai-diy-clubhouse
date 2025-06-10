
import React from 'react';
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
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface OnboardingRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecover: () => void;
  onStartOver: () => void;
}

export const OnboardingRecoveryDialog: React.FC<OnboardingRecoveryDialogProps> = ({
  open,
  onOpenChange,
  onRecover,
  onStartOver
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Dados Encontrados
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Encontramos dados de onboarding salvos anteriormente. 
              Deseja recuperar onde parou ou começar novamente?
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Dica:</strong> Seus dados são salvos automaticamente 
                enquanto preenche o formulário para evitar perdas.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onStartOver}
            className="w-full sm:w-auto"
          >
            Começar Novamente
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={onRecover}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recuperar Dados
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
