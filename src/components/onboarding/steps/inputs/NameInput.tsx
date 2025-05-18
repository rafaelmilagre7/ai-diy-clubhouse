
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
}

export const NameInput = ({ 
  value, 
  onChange, 
  disabled, 
  readOnly,
  className,
  id = "name"
}: NameInputProps) => (
  <div className={className}>
    <Label htmlFor={id}>Nome Completo</Label>
    <Input
      id={id}
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
