
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface StatusToggleProps {
  form: any;
}

export const StatusToggle = ({ form }: StatusToggleProps) => {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
          <div className="space-y-0.5">
            <FormLabel>Status</FormLabel>
            <FormDescription>
              Tornar esta ferramenta visível para os membros
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
