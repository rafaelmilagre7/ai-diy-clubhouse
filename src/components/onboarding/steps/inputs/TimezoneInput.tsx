
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Lista de fusos horários GMT
const timezones = [
  "GMT-12", "GMT-11", "GMT-10", "GMT-9", "GMT-8", "GMT-7", "GMT-6", "GMT-5", "GMT-4", "GMT-3",
  "GMT-2", "GMT-1", "GMT+0", "GMT+1", "GMT+2", "GMT+3", "GMT+4", "GMT+5", "GMT+6", 
  "GMT+7", "GMT+8", "GMT+9", "GMT+10", "GMT+11", "GMT+12", "GMT+13", "GMT+14"
];

interface TimezoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const TimezoneInput = ({ value, onChange, disabled }: TimezoneInputProps) => (
  <div>
    <Label htmlFor="timezone">Fuso Horário</Label>
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione o fuso horário" />
      </SelectTrigger>
      <SelectContent>
        {timezones.map(tz => (
          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
