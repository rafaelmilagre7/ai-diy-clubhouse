
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryInputProps {
  form: any;
}

export const CategoryInput = ({ form }: CategoryInputProps) => {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoria*</FormLabel>
          <Select 
            value={field.value} 
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Modelos de IA e Interfaces">Modelos de IA e Interfaces</SelectItem>
              <SelectItem value="Geração de Conteúdo Visual">Geração de Conteúdo Visual</SelectItem>
              <SelectItem value="Geração e Processamento de Áudio">Geração e Processamento de Áudio</SelectItem>
              <SelectItem value="Automação e Integrações">Automação e Integrações</SelectItem>
              <SelectItem value="Comunicação e Atendimento">Comunicação e Atendimento</SelectItem>
              <SelectItem value="Captura e Análise de Dados">Captura e Análise de Dados</SelectItem>
              <SelectItem value="Pesquisa e Síntese de Informações">Pesquisa e Síntese de Informações</SelectItem>
              <SelectItem value="Gestão de Documentos e Conteúdo">Gestão de Documentos e Conteúdo</SelectItem>
              <SelectItem value="Marketing e CRM">Marketing e CRM</SelectItem>
              <SelectItem value="Produtividade e Organização">Produtividade e Organização</SelectItem>
              <SelectItem value="Desenvolvimento e Código">Desenvolvimento e Código</SelectItem>
              <SelectItem value="Plataformas de Mídia">Plataformas de Mídia</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
