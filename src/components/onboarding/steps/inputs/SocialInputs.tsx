
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormFeedback } from "@/components/ui/form-feedback";
import { Linkedin, Instagram } from "lucide-react";
import { validateLinkedInUrl, validateInstagramUrl } from "@/utils/validationUtils";

interface SocialInputsProps {
  linkedin?: string;
  instagram?: string;
  onChangeLinkedin?: (value: string) => void;
  onChangeInstagram?: (value: string) => void;
  disabled?: boolean;
  errors?: {
    linkedin?: string;
    instagram?: string;
  };
}

export const SocialInputs = ({
  linkedin = "",
  instagram = "",
  onChangeLinkedin,
  onChangeInstagram,
  disabled = false,
  errors = {}
}: SocialInputsProps) => {
  const { register, formState: { errors: formErrors } } = useFormContext();
  
  // Se estiver usando react-hook-form
  if (!onChangeLinkedin && !onChangeInstagram) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="linkedin" className="block text-sm font-medium">
            LinkedIn
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Linkedin className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="linkedin"
              type="text"
              placeholder="linkedin.com/in/seuperfil"
              className="pl-10"
              {...register("linkedin", {
                validate: {
                  validLinkedIn: (value) => !value || validateLinkedInUrl(value) || "URL do LinkedIn inválida"
                }
              })}
            />
          </div>
          {formErrors.linkedin && (
            <FormFeedback error={formErrors.linkedin.message as string} />
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="instagram" className="block text-sm font-medium">
            Instagram
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Instagram className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="instagram"
              type="text"
              placeholder="@seuinsta"
              className="pl-10"
              {...register("instagram", {
                validate: {
                  validInstagram: (value) => !value || validateInstagramUrl(value) || "Usuário do Instagram inválido"
                }
              })}
            />
          </div>
          {formErrors.instagram && (
            <FormFeedback error={formErrors.instagram.message as string} />
          )}
        </div>
      </div>
    );
  }
  
  // Se estiver usando componente controlado
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label htmlFor="linkedin" className="block text-sm font-medium">
          LinkedIn
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Linkedin className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            id="linkedin"
            type="text"
            value={linkedin}
            onChange={e => onChangeLinkedin && onChangeLinkedin(e.target.value)}
            disabled={disabled}
            placeholder="linkedin.com/in/seuperfil"
            className="pl-10"
          />
        </div>
        {errors.linkedin && (
          <FormFeedback error={errors.linkedin} />
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="instagram" className="block text-sm font-medium">
          Instagram
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Instagram className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            id="instagram"
            type="text"
            value={instagram}
            onChange={e => onChangeInstagram && onChangeInstagram(e.target.value)}
            disabled={disabled}
            placeholder="@seuinsta"
            className="pl-10"
          />
        </div>
        {errors.instagram && (
          <FormFeedback error={errors.instagram} />
        )}
      </div>
    </div>
  );
};
