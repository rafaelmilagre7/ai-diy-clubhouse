
import React from "react";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PersonalInfoForm = ({ 
  formData, 
  errors, 
  onChange, 
  isSubmitting, 
  onSubmit 
}) => {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }} className="space-y-6">
      <MilagrinhoMessage 
        message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club." 
      />
      
      {hasErrors && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, preencha todos os campos obrigatórios antes de continuar.
          </AlertDescription>
        </Alert>
      )}
      
      <PersonalInfoInputs 
        formData={formData} 
        onChange={onChange} 
        disabled={isSubmitting}
        errors={errors}
      />
      
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSubmitting ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
};
