
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";
import { getNowInBrazil, formatDateTimeLocal } from "@/utils/timezoneUtils";

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
      
      // Voltar para datas/horários completos para evento único
      const currentStart = form.getValues("start_time");
      const currentEnd = form.getValues("end_time");
      
      if (!currentStart || !currentEnd) {
        const nowInBrazil = getNowInBrazil();
        const defaultStart = new Date(nowInBrazil);
        defaultStart.setMinutes(0, 0, 0);
        defaultStart.setHours(defaultStart.getHours() + 1);
        
        const defaultEnd = new Date(defaultStart);
        defaultEnd.setHours(defaultEnd.getHours() + 1);
        
        form.setValue("start_time", formatDateTimeLocal(defaultStart));
        form.setValue("end_time", formatDateTimeLocal(defaultEnd));
      }
    } else if (!pattern) {
      // Definir padrões iniciais quando ativada
      form.setValue("recurrence_pattern", "weekly");
      form.setValue("recurrence_interval", 1);
      
      // Definir um dia da semana padrão para eventos semanais (segunda-feira = 1)
      if (!form.getValues("recurrence_day")) {
        form.setValue("recurrence_day", 1);
      }
      
      // Definir horários padrão se não existirem
      const currentStart = form.getValues("start_time");
      const currentEnd = form.getValues("end_time");
      
      if (!currentStart || !currentEnd) {
        const today = formatDateTimeLocal(getNowInBrazil()).split('T')[0];
        form.setValue("start_time", `${today}T14:00`);
        form.setValue("end_time", `${today}T15:00`);
      }
    }
  }, [isRecurring, pattern, form]);

  return {
    isRecurring,
    pattern,
  };
}
