
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../../types/toolFormTypes';

interface DescriptionInputProps {
  form: UseFormReturn<ToolFormValues>;
}

export const DescriptionInput = ({ form }: DescriptionInputProps) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Descreva o que a ferramenta faz..." 
              {...field} 
              rows={4}
            />
          </FormControl>
          <FormDescription>
            Descrição clara e objetiva da ferramenta
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
