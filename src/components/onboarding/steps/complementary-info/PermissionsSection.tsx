
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface PermissionsSectionProps {
  form: UseFormReturn<any>;
}

export const PermissionsSection = ({ form }: PermissionsSectionProps) => {
  const { watch, setValue } = form;

  return (
    <div className="bg-card p-6 rounded-lg border border-border space-y-6">
      <h3 className="text-lg font-semibold">Permissões e Interesses</h3>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="authorize_case_usage"
            checked={watch("authorize_case_usage")}
            onCheckedChange={(checked) => 
              setValue("authorize_case_usage", checked === true)
            }
          />
          <div className="space-y-1">
            <Label htmlFor="authorize_case_usage" className="font-medium">
              Autorizo o uso do meu caso como exemplo de sucesso
            </Label>
            <p className="text-sm text-muted-foreground">
              Permite que compartilhemos resultados obtidos com sua implementação 
              (sem dados sensíveis ou confidenciais).
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="interested_in_interview"
            checked={watch("interested_in_interview")}
            onCheckedChange={(checked) => 
              setValue("interested_in_interview", checked === true)
            }
          />
          <div className="space-y-1">
            <Label htmlFor="interested_in_interview" className="font-medium">
              Tenho interesse em participar de entrevistas e cases
            </Label>
            <p className="text-sm text-muted-foreground">
              Podemos entrar em contato para entrevistas e compartilhamento de experiência.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
