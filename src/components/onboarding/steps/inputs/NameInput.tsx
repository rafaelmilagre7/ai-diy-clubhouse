
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export const NameInput = ({ value, onChange, disabled, readOnly }: NameInputProps) => (
  <div className="w-full">
    <Label htmlFor="name" className="text-white">Nome Completo</Label>
    <Input
      id="name"
      type="text"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="Seu nome completo"
      className="bg-[#1A1E2E] !bg-[#1A1E2E] text-white border-neutral-700"
    />
  </div>
);
