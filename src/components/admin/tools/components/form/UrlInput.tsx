
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ToolFormValues } from "../../types/toolFormTypes";
import { Link } from "lucide-react";

interface UrlInputProps {
  form: UseFormReturn<ToolFormValues>;
}

export const UrlInput = ({ form }: UrlInputProps) => {
  return (
    <FormField
      control={form.control}
      name="official_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>URL Oficial</FormLabel>
          <FormControl>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Link className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input 
                placeholder="https://www.exemplo.com" 
                className="pl-10" 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  // Marcar o formulário como modificado
                  form.setValue("formModified", true);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
