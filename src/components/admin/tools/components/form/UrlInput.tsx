
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface UrlInputProps {
  form: any;
}

export const UrlInput = ({ form }: UrlInputProps) => {
  return (
    <FormField
      control={form.control}
      name="official_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>URL Oficial*</FormLabel>
          <FormControl>
            <Input placeholder="https://www.exemplo.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
