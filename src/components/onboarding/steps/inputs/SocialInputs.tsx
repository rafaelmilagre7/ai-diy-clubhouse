
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";
import { validateLinkedInUrl, validateInstagramUrl } from "@/utils/validationUtils";

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
  const linkedinIsValid = linkedin ? validateLinkedInUrl(linkedin) : true;
  const instagramIsValid = instagram ? validateInstagramUrl(instagram) : true;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="linkedin" className={cn(
          "transition-colors flex items-center gap-2",
          errors.linkedin ? "text-red-500" : linkedin && linkedinIsValid ? "text-[#0ABAB5]" : ""
        )}>
          LinkedIn (opcional)
          {linkedin && (
            linkedinIsValid ? (
              <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )
          )}
        </Label>
        <Input
          id="linkedin"
          placeholder="linkedin.com/in/seu-perfil"
          value={linkedin}
          onChange={(e) => onChangeLinkedin(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.linkedin ? "border-red-500 focus:border-red-500" : 
            linkedin && linkedinIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}
        />
        <FormMessage
          type={linkedin && linkedinIsValid ? "success" : "error"}
          message={errors.linkedin || (linkedin && !linkedinIsValid ? "Digite uma URL válida do LinkedIn" : undefined)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram" className={cn(
          "transition-colors flex items-center gap-2",
          errors.instagram ? "text-red-500" : instagram && instagramIsValid ? "text-[#0ABAB5]" : ""
        )}>
          Instagram (opcional)
          {instagram && (
            instagramIsValid ? (
              <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )
          )}
        </Label>
        <Input
          id="instagram"
          placeholder="instagram.com/seu-perfil"
          value={instagram}
          onChange={(e) => onChangeInstagram(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.instagram ? "border-red-500 focus:border-red-500" : 
            instagram && instagramIsValid ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
          )}
        />
        <FormMessage
          type={instagram && instagramIsValid ? "success" : "error"}
          message={errors.instagram || (instagram && !instagramIsValid ? "Digite uma URL válida do Instagram" : undefined)}
        />
      </div>
    </div>
  );
};
