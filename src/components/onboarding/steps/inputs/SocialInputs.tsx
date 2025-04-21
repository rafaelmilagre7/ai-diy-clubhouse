
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface SocialInputsProps {
  linkedin: string;
  instagram: string;
  onChangeLinkedin: (value: string) => void;
  onChangeInstagram: (value: string) => void;
  disabled?: boolean;
  errors: {
    linkedin?: string;
    instagram?: string;
  };
  isValid?: {
    linkedin?: boolean;
    instagram?: boolean;
  };
}

export const SocialInputs: React.FC<SocialInputsProps> = ({
  linkedin,
  instagram,
  onChangeLinkedin,
  onChangeInstagram,
  disabled,
  errors,
  isValid = { linkedin: false, instagram: false }
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="linkedin" className={cn(
          "transition-colors flex items-center",
          errors.linkedin ? "text-red-500" : linkedin && isValid.linkedin ? "text-[#0ABAB5]" : ""
        )}>
          LinkedIn (opcional)
          {isValid.linkedin && linkedin && (
            <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
          )}
        </Label>
        <Input
          id="linkedin"
          placeholder="https://linkedin.com/in/seu-perfil"
          value={linkedin}
          onChange={(e) => onChangeLinkedin(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.linkedin ? "border-red-500 focus:border-red-500" : 
            linkedin && isValid.linkedin ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}
        />
        <FormMessage
          type={linkedin && isValid.linkedin ? "success" : "error"}
          message={errors.linkedin}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram" className={cn(
          "transition-colors flex items-center",
          errors.instagram ? "text-red-500" : instagram && isValid.instagram ? "text-[#0ABAB5]" : ""
        )}>
          Instagram (opcional)
          {isValid.instagram && instagram && (
            <CheckCircle className="ml-2 h-4 w-4 text-[#0ABAB5]" />
          )}
        </Label>
        <Input
          id="instagram"
          placeholder="https://instagram.com/seu-perfil"
          value={instagram}
          onChange={(e) => onChangeInstagram(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.instagram ? "border-red-500 focus:border-red-500" : 
            instagram && isValid.instagram ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}
        />
        <FormMessage
          type={instagram && isValid.instagram ? "success" : "error"}
          message={errors.instagram}
        />
      </div>
    </div>
  );
};
