
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormValidationErrorsProps {
  errors: string[];
}
export const FormValidationErrors: React.FC<FormValidationErrorsProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null;
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {errors.map((err, i) => (
          <div key={i}>{err}</div>
        ))}
      </AlertDescription>
    </Alert>
  );
};
