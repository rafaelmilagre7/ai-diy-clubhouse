
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";

interface EventBasicInfoProps {
  form: UseFormReturn<EventFormData>;
}

export const EventBasicInfo = ({ form }: EventBasicInfoProps) => {
  return (
    <div className="space-y-6 p-6 surface-elevated rounded-xl border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-aurora-primary rounded-full" />
        <h3 className="text-heading-3">Informações Básicas</h3>
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label">Título do Evento</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Digite o nome do evento..." 
                  className="bg-surface-base border-border/50 focus:border-aurora-primary/50 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label">Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Descreva o evento, objetivos e público-alvo..." 
                  className="resize-none bg-surface-base border-border/50 focus:border-aurora-primary/50 transition-smooth min-h-[100px]"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
