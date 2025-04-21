
import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AIFormationQuestionsProps {
  control: any;
  completedFormationError?: FieldError;
  isMemberError?: FieldError;
}

export const AIFormationQuestions: React.FC<AIFormationQuestionsProps> = ({ 
  control, 
  completedFormationError, 
  isMemberError 
}) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-gray-800">Você já completou a Formação VIVER DE IA?</h3>
      <p className="text-sm text-gray-500 mb-3">Informação importante para personalizar sua experiência.</p>
      <Controller
        control={control}
        name="completed_formation"
        render={({ field, fieldState }) => (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id="completed-formation"
              />
              <Label htmlFor="completed-formation">
                {field.value ? "Sim" : "Não"}
              </Label>
            </div>
            {(fieldState.error || completedFormationError) && (
              <span className="text-red-500 text-xs">
                {fieldState.error?.message || completedFormationError?.message}
              </span>
            )}
          </div>
        )}
      />
    </div>
    <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-gray-800">Você já é membro do VIVER DE IA Club há mais de um mês?</h3>
      <p className="text-sm text-gray-500 mb-3">Precisamos entender sua experiência no Club até agora.</p>
      <Controller
        control={control}
        name="is_member_for_month"
        render={({ field, fieldState }) => (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id="is-member-month"
              />
              <Label htmlFor="is-member-month">
                {field.value ? "Sim" : "Não"}
              </Label>
            </div>
            {(fieldState.error || isMemberError) && (
              <span className="text-red-500 text-xs">
                {fieldState.error?.message || isMemberError?.message}
              </span>
            )}
          </div>
        )}
      />
    </div>
  </div>
);
