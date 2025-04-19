
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
              <SelectItem value="IA">Inteligência Artificial</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="Automação">Automação</SelectItem>
              <SelectItem value="No-Code">No-Code</SelectItem>
              <SelectItem value="Integração">Integração</SelectItem>
              <SelectItem value="Produtividade">Produtividade</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
