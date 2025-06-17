
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";
import { RecurrenceToggle } from "./recurrence/RecurrenceToggle";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventDateTimeProps {
  form: UseFormReturn<EventFormData>;
}

// Função para extrair apenas o horário (HH:MM) de um datetime string
const extractTimeFromDateTime = (datetimeString: string): string => {
  if (!datetimeString || !datetimeString.includes('T')) {
    return '';
  }
  
  const timePart = datetimeString.split('T')[1];
  if (!timePart) return '';
  
  // Retornar apenas HH:MM
  return timePart.substring(0, 5);
};

export const EventDateTime = ({ form }: EventDateTimeProps) => {
  const isRecurring = form.watch("is_recurring");
  
  // Função para obter data atual no formato datetime-local
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
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
        // Campos para evento recorrente
        <div className="space-y-4">
          <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription className="flex items-center gap-2 text-xs">
              <Info size={14} />
              <span>
                Para eventos recorrentes, defina a data de início da recorrência e os horários que se repetirão em cada ocorrência.
              </span>
            </AlertDescription>
          </Alert>
          
          {/* Data de início da recorrência */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início da Recorrência</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field}
                    defaultValue={field.value || getCurrentDateTime()}
                    className="pointer-events-auto" 
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Data a partir da qual as ocorrências do evento serão geradas
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Horários que se repetirão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => {
                // Extrair apenas o horário se o campo já tiver algum valor
                const timeValue = field.value ? extractTimeFromDateTime(field.value) : '';
                
                return (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        value={timeValue}
                        onChange={(e) => {
                          // Manter a data base atual ou usar a data atual
                          const currentDate = field.value ? field.value.split('T')[0] : getCurrentDateTime().split('T')[0];
                          field.onChange(`${currentDate}T${e.target.value}`);
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
                const timeValue = field.value ? extractTimeFromDateTime(field.value) : '';
                
                return (
                  <FormItem>
                    <FormLabel>Horário de Término</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        value={timeValue}
                        onChange={(e) => {
                          // Usar a mesma data base do start_time
                          const startTimeDate = form.watch("start_time");
                          const currentDate = startTimeDate ? startTimeDate.split('T')[0] : getCurrentDateTime().split('T')[0];
                          field.onChange(`${currentDate}T${e.target.value}`);
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
