
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export const EmailInput = ({ value, onChange, disabled, readOnly }: EmailInputProps) => (
  <div>
    <Label htmlFor="email" className="text-white">E-mail</Label>
    <Input
      id="email"
      type="email"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="exemplo@dominio.com"
      className="bg-[#1A1E2E] text-white border-neutral-700"
    />
  </div>
);
