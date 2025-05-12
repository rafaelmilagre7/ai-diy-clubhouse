
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";

export function useRecurrence(form: UseFormReturn<EventFormData>) {
  const isRecurring = form.watch("is_recurring");
  const pattern = form.watch("recurrence_pattern");
  const startDate = form.watch("start_time");

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
    }
  }, [isRecurring, pattern, form]);

  // Configurar dia da semana com base na data de início
  useEffect(() => {
    if (isRecurring && pattern === "weekly" && startDate) {
      const date = new Date(startDate);
      const day = date.getDay(); // 0 = domingo, 1 = segunda, etc.
      form.setValue("recurrence_day", day);
    }
  }, [isRecurring, pattern, startDate, form]);

  return {
    isRecurring,
    pattern,
  };
}
