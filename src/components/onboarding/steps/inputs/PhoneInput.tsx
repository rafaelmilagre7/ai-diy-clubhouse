
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  ddi: string;
  onChangeDDI: (value: string) => void;
  // Novas propriedades
  onBlur?: () => void;
  isValid?: boolean;
  showLabel?: boolean;
}

export const PhoneInput = ({ 
  value, 
  onChange, 
  disabled, 
  error, 
  ddi,
  onChangeDDI,
  onBlur,
  isValid,
  showLabel = true
}: PhoneInputProps) => {
  const commonDDIs = [
    { value: "+55", label: "Brasil +55" },
    { value: "+1", label: "EUA/Canadá +1" },
    { value: "+351", label: "Portugal +351" },
    { value: "+34", label: "Espanha +34" }
  ];
  
  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor="phone" className={error ? "text-red-400" : ""}>
          Telefone
        </Label>
      )}
      <div className="flex gap-2">
        <div className="w-28">
          <Select value={ddi} onValueChange={onChangeDDI} disabled={disabled}>
            <SelectTrigger className="bg-[#1A1E2E] border-neutral-700">
              <SelectValue placeholder="+55" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1E2E] border-neutral-700">
              {commonDDIs.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Input
            id="phone"
            type="tel"
            value={value}
            disabled={disabled}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="(00) 00000-0000"
            className={`bg-[#1A1E2E] text-white ${error ? "border-red-400" : isValid ? "border-green-400" : "border-neutral-700"}`}
            style={{ backgroundColor: '#1A1E2E', color: 'white' }}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
