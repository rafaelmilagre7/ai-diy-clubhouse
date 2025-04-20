
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialInputsProps {
  linkedin: string;
  instagram: string;
  onChangeLinkedin: (value: string) => void;
  onChangeInstagram: (value: string) => void;
  disabled: boolean;
}

export const SocialInputs = ({
  linkedin,
  instagram,
  onChangeLinkedin,
  onChangeInstagram,
  disabled,
}: SocialInputsProps) => (
  <>
    <div>
      <Label htmlFor="linkedin">LinkedIn</Label>
      <Input
        id="linkedin"
        type="url"
        value={linkedin}
        disabled={disabled}
        onChange={e => onChangeLinkedin(e.target.value)}
        placeholder="https://linkedin.com/in/seunome"
      />
    </div>
    <div>
      <Label htmlFor="instagram">Instagram</Label>
      <Input
        id="instagram"
        type="url"
        value={instagram}
        disabled={disabled}
        onChange={e => onChangeInstagram(e.target.value)}
        placeholder="https://instagram.com/seunome"
      />
    </div>
  </>
);
