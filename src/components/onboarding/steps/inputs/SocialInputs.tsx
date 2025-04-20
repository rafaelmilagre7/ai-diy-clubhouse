
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialInputsProps {
  linkedin: string;
  instagram: string;
  onChangeLinkedin: (value: string) => void;
  onChangeInstagram: (value: string) => void;
  disabled: boolean;
  errors?: {
    linkedin?: string;
    instagram?: string;
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
  <>
    <div className="space-y-1">
      <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
      <Input
        id="linkedin"
        type="url"
        value={linkedin}
        disabled={disabled}
        onChange={e => onChangeLinkedin(e.target.value)}
        placeholder="https://linkedin.com/in/seunome"
        className={errors.linkedin ? 'border-red-500' : ''}
      />
      {errors.linkedin && <p className="text-sm text-red-500 mt-1">{errors.linkedin}</p>}
    </div>
    <div className="space-y-1">
      <Label htmlFor="instagram">Instagram (opcional)</Label>
      <Input
        id="instagram"
        type="url"
        value={instagram}
        disabled={disabled}
        onChange={e => onChangeInstagram(e.target.value)}
        placeholder="https://instagram.com/seunome"
        className={errors.instagram ? 'border-red-500' : ''}
      />
      {errors.instagram && <p className="text-sm text-red-500 mt-1">{errors.instagram}</p>}
    </div>
  </>
);
