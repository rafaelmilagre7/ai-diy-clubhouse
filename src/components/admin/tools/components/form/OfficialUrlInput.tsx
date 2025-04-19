
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../../types/toolFormTypes';

interface OfficialUrlInputProps {
  form: UseFormReturn<ToolFormValues>;
}

export const OfficialUrlInput = ({ form }: OfficialUrlInputProps) => {
  return (
    <FormField
      control={form.control}
      name="official_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>URL Oficial</FormLabel>
          <FormControl>
            <Input 
              placeholder="https://exemplo.com" 
              type="url"
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Website oficial da ferramenta
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
