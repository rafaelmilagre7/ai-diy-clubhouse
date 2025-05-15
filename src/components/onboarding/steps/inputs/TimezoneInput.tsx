
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimezoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const TimezoneInput = ({ 
  value, 
  onChange, 
  disabled,
  error
}: TimezoneInputProps) => {
  const timezones = [
    { value: "GMT-3", label: "Brasília (GMT-3)" },
    { value: "GMT-4", label: "Manaus (GMT-4)" },
    { value: "GMT-5", label: "Acre (GMT-5)" },
    { value: "GMT+0", label: "Londres (GMT+0)" },
    { value: "GMT+1", label: "Paris (GMT+1)" },
    { value: "GMT-5", label: "Nova York (GMT-5)" },
    { value: "GMT-8", label: "São Francisco (GMT-8)" }
  ];
  
  return (
    <div className="space-y-2">
      <Label htmlFor="timezone" className={error ? "text-red-400" : ""}>
        Fuso Horário
      </Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id="timezone" 
          className={`bg-[#1A1E2E] ${error ? "border-red-400" : "border-neutral-700"}`}
        >
          <SelectValue placeholder="Selecione seu fuso horário" />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1E2E] border-neutral-700">
          {timezones.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
