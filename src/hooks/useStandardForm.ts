import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormState } from "./useFormState";
import { useFormMutation } from "./useFormData";

interface UseStandardFormOptions<T extends z.ZodSchema> {
  schema: T;
  defaultValues?: z.infer<T>;
  mutationFn: (data: z.infer<T>) => Promise<any>;
  onSuccess?: () => void;
  successMessage?: string;
  invalidateQueries?: string[][];
  debounceMs?: number;
}

export function useStandardForm<T extends z.ZodSchema>({
  schema,
  defaultValues,
  mutationFn,
  onSuccess,
  successMessage = "Operação realizada com sucesso!",
  invalidateQueries = [],
  debounceMs = 300,
}: UseStandardFormOptions<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { isSubmitting, error, handleSubmit, resetState } = useFormState({
    debounceMs,
    onSuccess,
  });

  const mutation = useFormMutation(mutationFn, {
    invalidateQueries,
  });

  const onSubmit = async (data: z.infer<T>) => {
    await handleSubmit(async () => {
      const result = await mutation.mutateAsync(data);
      return result;
    }, successMessage);
  };

  const reset = () => {
    form.reset();
    resetState();
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    error,
    reset,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
}