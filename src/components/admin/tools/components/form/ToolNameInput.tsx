
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../../types/toolFormTypes';

interface ToolNameInputProps {
  form: UseFormReturn<ToolFormValues>;
}

export const ToolNameInput = ({ form }: ToolNameInputProps) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome da Ferramenta</FormLabel>
          <FormControl>
            <Input placeholder="Ex: ChatGPT" {...field} />
          </FormControl>
          <FormDescription>
            Nome da ferramenta como é conhecido no mercado.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
