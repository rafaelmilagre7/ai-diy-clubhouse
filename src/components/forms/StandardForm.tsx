import { ReactNode } from "react";
import { z } from "zod";
import { useStandardForm } from "@/hooks/useStandardForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface StandardFormProps<T extends z.ZodSchema> {
  schema: T;
  defaultValues?: z.infer<T>;
  mutationFn: (data: z.infer<T>) => Promise<any>;
  onSuccess?: () => void;
  successMessage?: string;
  invalidateQueries?: string[][];
  debounceMs?: number;
  children: (form: any) => ReactNode;
  submitText?: string;
  className?: string;
}

export function StandardForm<T extends z.ZodSchema>({
  schema,
  defaultValues,
  mutationFn,
  onSuccess,
  successMessage,
  invalidateQueries,
  debounceMs,
  children,
  submitText = "Salvar",
  className = "space-y-6",
}: StandardFormProps<T>) {
  const { form, onSubmit, isSubmitting, error, isValid, isDirty } = useStandardForm({
    schema,
    defaultValues,
    mutationFn,
    onSuccess,
    successMessage,
    invalidateQueries,
    debounceMs,
  });

  return (
    <form onSubmit={onSubmit} className={className}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {children(form)}

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !isValid}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : submitText}
        </Button>
      </div>
    </form>
  );
}