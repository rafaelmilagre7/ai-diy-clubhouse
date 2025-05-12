
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export const NameInput = ({ value, onChange, disabled, readOnly }: NameInputProps) => (
  <div>
    <Label htmlFor="name">Nome Completo</Label>
    <Input
      id="name"
      type="text"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="Seu nome completo"
    />
  </div>
);
