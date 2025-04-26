
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SolutionFormValues } from "./solutionFormSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  difficultyLabels, 
  getDifficultyColor, 
  translateDifficultyToEnum 
} from "@/utils/difficultyUtils";

interface BasicInfoRightColumnProps {
  form: UseFormReturn<SolutionFormValues>;
  difficulty: string;
}

const BasicInfoRightColumn: React.FC<BasicInfoRightColumnProps> = ({ 
  form,
  difficulty
}) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="revenue">Aumento de Receita</SelectItem>
                <SelectItem value="operational">Otimização Operacional</SelectItem>
                <SelectItem value="strategy">Gestão Estratégica</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              A trilha em que esta solução será categorizada.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="difficulty"
        render={({ field }) => {
          // Garantir que o valor armazenado no formulário é sempre o enum
          const normalizedValue = translateDifficultyToEnum(field.value);
          
          return (
            <FormItem>
              <FormLabel>Dificuldade</FormLabel>
              <Select
                onValueChange={(value) => {
                  // Garantir que o valor definido é sempre o enum
                  field.onChange(translateDifficultyToEnum(value));
                }}
                value={normalizedValue}
              >
                <FormControl>
                  <SelectTrigger 
                    className={normalizedValue ? `${getDifficultyColor(normalizedValue)} border-0` : ""}
                  >
                    <SelectValue placeholder="Selecione uma dificuldade">
                      {normalizedValue ? difficultyLabels[normalizedValue] : ""}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="easy" className="bg-green-100 hover:bg-green-200">
                    Fácil
                  </SelectItem>
                  <SelectItem value="medium" className="bg-yellow-100 hover:bg-yellow-200">
                    Normal
                  </SelectItem>
                  <SelectItem value="advanced" className="bg-orange-100 hover:bg-orange-200">
                    Avançado
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                O nível de dificuldade de implementação da solução.
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default BasicInfoRightColumn;
