
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface SocialInputsProps {
  linkedin: string;
  instagram: string;
  onChangeLinkedin: (value: string) => void;
  onChangeInstagram: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
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
  readOnly,
  errors = {}
}: SocialInputsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          type="text"
          value={linkedin}
          onChange={e => onChangeLinkedin(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          placeholder="linkedin.com/in/seuperfil"
          className={errors.linkedin ? "border-red-400" : ""}
        />
        {errors.linkedin && (
          <p className="text-xs text-red-500 mt-1">
            {typeof errors.linkedin === 'string' ? errors.linkedin : errors.linkedin.message}
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="instagram">Instagram</Label>
        <Input
          id="instagram"
          type="text"
          value={instagram}
          onChange={e => onChangeInstagram(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          placeholder="@seuperfil ou instagram.com/seuperfil"
          className={errors.instagram ? "border-red-400" : ""}
        />
        {errors.instagram && (
          <p className="text-xs text-red-500 mt-1">
            {typeof errors.instagram === 'string' ? errors.instagram : errors.instagram.message}
          </p>
        )}
      </div>
    </div>
  );
};
