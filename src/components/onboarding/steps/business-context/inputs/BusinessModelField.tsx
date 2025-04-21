
import React from "react";
import { Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const businessModels = [
  { id: "b2b", label: "B2B - Business to Business" },
  { id: "b2c", label: "B2C - Business to Consumer" },
  { id: "b2b2c", label: "B2B2C - Business to Business to Consumer" },
  { id: "d2c", label: "D2C - Direct to Consumer" },
  { id: "saas", label: "SaaS - Software as a Service" },
  { id: "marketplace", label: "Marketplace" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "subscription", label: "Assinatura / Recorrência" },
  { id: "freelancer", label: "Freelancer / Autônomo" },
  { id: "consulting", label: "Consultoria" },
  { id: "agency", label: "Agência" },
];

interface Props {
  control: any;
  error?: any;
}

export const BusinessModelField: React.FC<Props> = ({ control, error }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">
      Modelo(s) de Negócio<span className="text-red-500">*</span>
    </h3>
    <Controller
      name="business_model"
      control={control}
      rules={{ required: "Por favor, selecione um modelo de negócio" }}
      render={({ field }) => (
        <RadioGroup
          onValueChange={field.onChange}
          value={field.value}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
        >
          {businessModels.map((model) => (
            <div key={model.id} className="flex items-center space-x-2">
              <RadioGroupItem value={model.id} id={`model-${model.id}`} />
              <Label htmlFor={`model-${model.id}`} className="cursor-pointer">{model.label}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
    />
    {error && <p className="text-red-500 text-sm">{error.message}</p>}
  </div>
);
