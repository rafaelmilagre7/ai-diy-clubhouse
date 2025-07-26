
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";
import { RecurrenceToggle } from "./recurrence/RecurrenceToggle";
import { Info } from "lucide-react";
import { extractLocalTime } from "@/utils/timezoneUtils";
import { TimezoneInfo } from "../TimezoneInfo";

interface EventDateTimeProps {
  form: UseFormReturn<EventFormData>;
}

export const EventDateTime = ({ form }: EventDateTimeProps) => {
  const isRecurring = form.watch("is_recurring");
  
  return (
    <div className="space-y-6 p-6 surface-elevated rounded-xl border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-operational rounded-full" />
        <h3 className="text-heading-3">Data e Horário</h3>
      </div>
      
      <div className="space-y-6">
        <TimezoneInfo />
        
        <RecurrenceToggle form={form} />

      {!isRecurring ? (
        // Campos para evento único (data e hora)
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data e Hora de Início</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field}
                    className="pointer-events-auto" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data e Hora de Término</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field}
                    className="pointer-events-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        // Campos para evento recorrente (apenas hora)
        <div>
          <div className="p-4 surface-overlay rounded-lg border border-viverblue/20 bg-viverblue/5 mb-4">
            <div className="flex items-center gap-2 text-viverblue mb-2">
              <Info size={16} />
              <span className="text-body-small font-medium">Configuração de Horário Recorrente</span>
            </div>
            <p className="text-body-small text-text-secondary">
              Para eventos recorrentes, informe apenas o horário de início e término que será repetido em cada ocorrência.
              Os horários estão no fuso horário de Brasília.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => {
                // Extrair apenas o horário se o campo já tiver algum valor
                const timeValue = field.value ? extractLocalTime(field.value) : '';
                
                return (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        value={timeValue}
                        onChange={(e) => {
                          // Manter uma data fictícia apenas para validação
                          const fakeDate = "2023-01-01";
                          field.onChange(`${fakeDate}T${e.target.value}`);
                        }}
                        className="pointer-events-auto" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => {
                // Extrair apenas o horário se o campo já tiver algum valor
                const timeValue = field.value ? extractLocalTime(field.value) : '';
                
                return (
                  <FormItem>
                    <FormLabel>Horário de Término</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        value={timeValue}
                        onChange={(e) => {
                          // Manter uma data fictícia apenas para validação
                          const fakeDate = "2023-01-01";
                          field.onChange(`${fakeDate}T${e.target.value}`);
                        }}
                        className="pointer-events-auto"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
