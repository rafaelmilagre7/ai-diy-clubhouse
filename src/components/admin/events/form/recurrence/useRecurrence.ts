
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";

export function useRecurrence(form: UseFormReturn<EventFormData>) {
  const isRecurring = form.watch("is_recurring");
  const pattern = form.watch("recurrence_pattern");
  
  // Gerenciar campos de recorrência
  useEffect(() => {
    if (!isRecurring) {
      // Limpar todos os campos de recorrência quando desativada
      form.setValue("recurrence_pattern", undefined);
      form.setValue("recurrence_interval", undefined);
      form.setValue("recurrence_day", undefined);
      form.setValue("recurrence_count", undefined);
      form.setValue("recurrence_end_date", undefined);
    } else if (!pattern) {
      // Definir padrões iniciais quando ativada
      form.setValue("recurrence_pattern", "weekly");
      form.setValue("recurrence_interval", 1);
      
      // Definir um dia da semana padrão para eventos semanais (segunda-feira = 1)
      if (!form.getValues("recurrence_day")) {
        form.setValue("recurrence_day", 1);
      }
    }
  }, [isRecurring, pattern, form]);

  return {
    isRecurring,
    pattern,
  };
}
