import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LearningModule } from "@/lib/supabase/types";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { DifficultyLevel } from "../types/aulaTypes";
import { LessonTagManager } from "../../../aulas/components/LessonTagManager";

interface EtapaInfoBasicaProps {
  form: UseFormReturn<AulaFormValues>;
  modules: LearningModule[];
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
  allowModuleSelection?: boolean;
}

const EtapaInfoBasica: React.FC<EtapaInfoBasicaProps> = ({
  form,
  modules,
  onNext,
  allowModuleSelection = false
}) => {
  const handleContinue = async () => {
    // Validar apenas os campos desta etapa
    const result = await form.trigger(['title', 'moduleId', 'description', 'difficultyLevel', 'tags']);
    if (result) {
      onNext();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Aula</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o título da aula" {...field} />
                </FormControl>
                <FormDescription>
                  O título deve ser claro e objetivo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição da Aula</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva brevemente o conteúdo da aula"
                    className="min-h-chart-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Uma breve descrição do que será abordado nesta aula
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allowModuleSelection && (
              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um módulo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      O módulo ao qual esta aula pertence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="difficultyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Dificuldade</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de dificuldade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DifficultyLevel.BEGINNER}>Iniciante</SelectItem>
                      <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediário</SelectItem>
                      <SelectItem value={DifficultyLevel.ADVANCED}>Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Nível de dificuldade do conteúdo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Tags da Aula */}
          <LessonTagManager form={form} fieldName="tags" />
        </div>
        
      </div>
    </Form>
  );
};

export default EtapaInfoBasica;