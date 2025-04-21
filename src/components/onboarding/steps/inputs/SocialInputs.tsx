
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";

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
}

export const SocialInputs: React.FC<SocialInputsProps> = ({
  linkedin,
  instagram,
  onChangeLinkedin,
  onChangeInstagram,
  disabled,
  errors
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
        <Input
          id="linkedin"
          placeholder="https://linkedin.com/in/seu-perfil"
          value={linkedin}
          onChange={(e) => onChangeLinkedin(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.linkedin ? "border-red-500 focus:border-red-500" : "focus:border-[#0ABAB5]"
          )}
        />
        <FormMessage
          type="error"
          message={errors.linkedin}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram">Instagram (opcional)</Label>
        <Input
          id="instagram"
          placeholder="https://instagram.com/seu-perfil"
          value={instagram}
          onChange={(e) => onChangeInstagram(e.target.value)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            errors.instagram ? "border-red-500 focus:border-red-500" : "focus:border-[#0ABAB5]"
          )}
        />
        <FormMessage
          type="error"
          message={errors.instagram}
        />
      </div>
    </div>
  );
};
