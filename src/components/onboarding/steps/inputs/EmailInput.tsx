
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
    <Label htmlFor="email">E-mail</Label>
    <Input
      id="email"
      type="email"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="exemplo@dominio.com"
    />
  </div>
);
