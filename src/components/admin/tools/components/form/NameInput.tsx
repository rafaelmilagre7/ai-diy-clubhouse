
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface NameInputProps {
  form: any;
}

export const NameInput = ({ form }: NameInputProps) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome da Ferramenta*</FormLabel>
          <FormControl>
            <Input placeholder="Ex: ChatGPT" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
