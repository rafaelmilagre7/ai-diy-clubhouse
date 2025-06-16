
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";
import { RecurrenceToggle } from "./recurrence/RecurrenceToggle";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { extractLocalTime } from "@/utils/timezoneUtils";

interface EventDateTimeProps {
  form: UseFormReturn<EventFormData>;
}

export const EventDateTime = ({ form }: EventDateTimeProps) => {
  const isRecurring = form.watch("is_recurring");
  
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h3 className="font-medium text-sm">Data e Horário</h3>
      </div>

      <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
        <AlertDescription className="flex items-center gap-2 text-xs">
          <Info size={14} />
          <span>
            Todos os horários são salvos e exibidos no fuso horário de Brasília (UTC-3).
          </span>
        </AlertDescription>
      </Alert>

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
          <Alert variant="info" className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription className="flex items-center gap-2 text-xs">
              <Info size={14} />
              <span>
                Para eventos recorrentes, informe apenas o horário de início e término que será repetido em cada ocorrência.
                Os horários estão no fuso horário de Brasília.
              </span>
            </AlertDescription>
          </Alert>
          
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
  );
};
