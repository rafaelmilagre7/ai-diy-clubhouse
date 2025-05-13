
import React, { memo } from "react";
import { Controller, FieldError } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AIFormationQuestionsProps {
  control: any;
  completedFormationError?: FieldError | any;
  isMemberError?: FieldError | any;
}

const AIFormationQuestionsComponent: React.FC<AIFormationQuestionsProps> = ({ 
  control, 
  completedFormationError, 
  isMemberError 
}) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-4 bg-[#151823] p-6 rounded-lg border border-neutral-700">
      <h3 className="text-lg font-medium text-white">Você já completou a Formação VIVER DE IA?</h3>
      <p className="text-sm text-neutral-400 mb-3">Informação importante para personalizar sua experiência.</p>
      <Controller
        control={control}
        name="completed_formation"
        render={({ field, fieldState }) => (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Switch
                checked={field.value || false}
                onCheckedChange={field.onChange}
                id="completed-formation"
              />
              <Label htmlFor="completed-formation" className="text-neutral-300">
                {field.value ? "Sim" : "Não"}
              </Label>
            </div>
            {(fieldState.error || completedFormationError) && (
              <span className="text-red-500 text-xs">
                {fieldState.error?.message || 
                (typeof completedFormationError === 'object' && 'message' in completedFormationError 
                  ? completedFormationError.message 
                  : '')}
              </span>
            )}
          </div>
        )}
      />
    </div>
    <div className="space-y-4 bg-[#151823] p-6 rounded-lg border border-neutral-700">
      <h3 className="text-lg font-medium text-white">Você já é membro do VIVER DE IA Club há mais de um mês?</h3>
      <p className="text-sm text-neutral-400 mb-3">Precisamos entender sua experiência no Club até agora.</p>
      <Controller
        control={control}
        name="is_member_for_month"
        render={({ field, fieldState }) => (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Switch
                checked={field.value || false}
                onCheckedChange={field.onChange}
                id="is-member-month"
              />
              <Label htmlFor="is-member-month" className="text-neutral-300">
                {field.value ? "Sim" : "Não"}
              </Label>
            </div>
            {(fieldState.error || isMemberError) && (
              <span className="text-red-500 text-xs">
                {fieldState.error?.message || 
                (typeof isMemberError === 'object' && 'message' in isMemberError 
                  ? isMemberError.message 
                  : '')}
              </span>
            )}
          </div>
        )}
      />
    </div>
  </div>
);

export const AIFormationQuestions = memo(AIFormationQuestionsComponent);
