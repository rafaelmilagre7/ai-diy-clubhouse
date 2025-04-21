
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface LocationInputsProps {
  country: string;
  state: string;
  city: string;
  onChangeCountry: (value: string) => void;
  onChangeState: (value: string) => void;
  onChangeCity: (value: string) => void;
  disabled?: boolean;
  errors: {
    state?: string;
    city?: string;
  };
  isValid?: {
    state?: boolean;
    city?: boolean;
  };
}

export const LocationInputs: React.FC<LocationInputsProps> = ({
  country,
  state,
  city,
  onChangeCountry,
  onChangeState,
  onChangeCity,
  disabled = false,
  errors,
  isValid = { state: false, city: false }
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="country" className="text-gray-700 flex items-center">
          País <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
        </Label>
        <Input
          id="country"
          value={country}
          onChange={(e) => onChangeCountry(e.target.value)}
          disabled={true}
          className="bg-gray-50 border-gray-200 text-gray-700"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="state" className={cn(
          "transition-colors flex items-center",
          errors.state ? "text-red-500" : state && isValid.state ? "text-[#0ABAB5]" : ""
        )}>
          Estado <span className="text-red-500">*</span>
          {isValid.state && state && (
            <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
          )}
        </Label>
        <Input
          id="state"
          placeholder="Ex: São Paulo"
          value={state}
          onChange={(e) => onChangeState(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.state ? "border-red-500 focus:border-red-500" : 
            state && isValid.state ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}
        />
        <FormMessage
          type={state && isValid.state ? "success" : "error"}
          message={errors.state}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className={cn(
          "transition-colors flex items-center",
          errors.city ? "text-red-500" : city && isValid.city ? "text-[#0ABAB5]" : ""
        )}>
          Cidade <span className="text-red-500">*</span>
          {isValid.city && city && (
            <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
          )}
        </Label>
        <Input
          id="city"
          placeholder="Ex: São Paulo"
          value={city}
          onChange={(e) => onChangeCity(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.city ? "border-red-500 focus:border-red-500" : 
            city && isValid.city ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}
        />
        <FormMessage
          type={city && isValid.city ? "success" : "error"}
          message={errors.city}
        />
      </div>
    </>
  );
};
