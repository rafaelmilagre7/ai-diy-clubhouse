
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from 'lucide-react';

interface UserNameInputProps {
  form: any;
  isRequired: boolean;
}

export const UserNameInput = ({ form, isRequired }: UserNameInputProps) => {
  return (
    <FormField
      control={form.control}
      name="userName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome da Pessoa
            {isRequired && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input 
              placeholder="Ex: João Silva" 
              {...field}
              disabled={!isRequired}
            />
          </FormControl>
          {isRequired && (
            <p className="text-xs text-muted-foreground">
              Nome obrigatório para envio via WhatsApp (usado no template)
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
