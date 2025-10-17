
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionInputProps {
  form: any;
}

export const DescriptionInput = ({ form }: DescriptionInputProps) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>Descrição*</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Descreva a ferramenta e suas principais funcionalidades..." 
              className="min-h-chart-sm"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
