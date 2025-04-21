
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Instagram } from "lucide-react";
import { FieldError } from "react-hook-form";

interface SocialInputsProps {
  linkedin: string;
  instagram: string;
  onChangeLinkedin: (value: string) => void;
  onChangeInstagram: (value: string) => void;
  disabled: boolean;
  errors?: {
    linkedin?: string | FieldError;
    instagram?: string | FieldError;
  };
}

export const SocialInputs = ({
  linkedin,
  instagram,
  onChangeLinkedin,
  onChangeInstagram,
  disabled,
  errors = {},
}: SocialInputsProps) => (
  <div className="space-y-6">
    <div className="space-y-1">
      <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
      <div className="relative">
        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          id="linkedin"
          type="url"
          value={linkedin}
          disabled={disabled}
          onChange={e => onChangeLinkedin(e.target.value)}
          placeholder="https://linkedin.com/in/seunome"
          className={`pl-10 ${errors.linkedin ? 'border-red-500' : ''}`}
        />
      </div>
      {errors.linkedin && (
        <p className="text-sm text-red-500 mt-1">
          {typeof errors.linkedin === 'string' ? errors.linkedin : errors.linkedin.message}
        </p>
      )}
    </div>
    
    <div className="space-y-1">
      <Label htmlFor="instagram">Instagram (opcional)</Label>
      <div className="relative">
        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          id="instagram"
          type="url"
          value={instagram}
          disabled={disabled}
          onChange={e => onChangeInstagram(e.target.value)}
          placeholder="https://instagram.com/seunome"
          className={`pl-10 ${errors.instagram ? 'border-red-500' : ''}`}
        />
      </div>
      {errors.instagram && (
        <p className="text-sm text-red-500 mt-1">
          {typeof errors.instagram === 'string' ? errors.instagram : errors.instagram.message}
        </p>
      )}
    </div>
  </div>
);
