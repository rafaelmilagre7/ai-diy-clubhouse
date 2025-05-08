
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface VideoUploadErrorProps {
  error: string;
  onRetry?: () => void;
  details?: string;
}

export const VideoUploadError: React.FC<VideoUploadErrorProps> = ({ 
  error, 
  onRetry,
  details
}) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center">
        Erro no Upload
        {onRetry && (
          <Button 
            size="sm" 
            variant="outline" 
            className="ml-4 h-7" 
            onClick={onRetry}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Tentar Novamente
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>{error}</p>
        {details && (
          <p className="mt-1 text-xs opacity-70">
            Detalhes técnicos: {details}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
