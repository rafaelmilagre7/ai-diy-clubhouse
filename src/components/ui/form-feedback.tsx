
import React from 'react';
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFeedbackProps {
  error?: string;
  success?: boolean;
  className?: string;
}

export const FormFeedback = ({ error, success, className }: FormFeedbackProps) => {
  if (!error && !success) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm mt-1",
        error ? "text-status-error" : "text-status-success",
        className
      )}
    >
      {error ? (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </>
      ) : success ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span>Campo válido</span>
        </>
      ) : null}
    </div>
  );
};
