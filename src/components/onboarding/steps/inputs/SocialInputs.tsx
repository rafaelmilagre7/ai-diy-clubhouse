
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Linkedin } from "lucide-react";

interface SocialInputsProps {
  linkedin: string;
  instagram: string;
  onChangeLinkedin: (value: string) => void;
  onChangeInstagram: (value: string) => void;
  disabled?: boolean;
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
  errors = {}
}: SocialInputsProps) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <div className="space-y-2">
      <Label htmlFor="linkedin" className={errors.linkedin ? "text-red-400" : ""}>
        LinkedIn (opcional)
      </Label>
      <div className="relative">
        <Input
          id="linkedin"
          type="url"
          value={linkedin}
          disabled={disabled}
          onChange={e => onChangeLinkedin(e.target.value)}
          placeholder="linkedin.com/in/seu-perfil"
          className={`pl-10 ${errors.linkedin ? "border-red-400" : ""}`}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <Linkedin size={16} />
        </div>
      </div>
      {errors.linkedin && <p className="text-sm text-red-400">{errors.linkedin}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor="instagram" className={errors.instagram ? "text-red-400" : ""}>
        Instagram (opcional)
      </Label>
      <div className="relative">
        <Input
          id="instagram"
          type="text"
          value={instagram}
          disabled={disabled}
          onChange={e => onChangeInstagram(e.target.value)}
          placeholder="@seu.perfil"
          className={`pl-10 ${errors.instagram ? "border-red-400" : ""}`}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <Instagram size={16} />
        </div>
      </div>
      {errors.instagram && <p className="text-sm text-red-400">{errors.instagram}</p>}
    </div>
  </div>
);
