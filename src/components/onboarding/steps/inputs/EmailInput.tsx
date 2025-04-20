
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const EmailInput = ({ value, onChange, disabled }: EmailInputProps) => (
  <div>
    <Label htmlFor="email">E-mail</Label>
    <Input
      id="email"
      type="email"
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="exemplo@dominio.com"
    />
  </div>
);
