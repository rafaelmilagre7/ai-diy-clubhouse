import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateSelectorProps {
  value?: string; // formato YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  placeholder = "Selecione a data",
  error
}) => {
  // Parse do valor atual
  const currentDate = value ? new Date(value) : null;
  const currentDay = currentDate ? currentDate.getDate().toString().padStart(2, '0') : '';
  const currentMonth = currentDate ? (currentDate.getMonth() + 1).toString().padStart(2, '0') : '';
  const currentYear = currentDate ? currentDate.getFullYear().toString() : '';

  // Gerar opções
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];
  
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYearNum - i).toString());

  const handleDateChange = (newDay?: string, newMonth?: string, newYear?: string) => {
    const day = newDay || currentDay;
    const month = newMonth || currentMonth;
    const year = newYear || currentYear;

    if (day && month && year) {
      // Validar se a data é válida
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (dateObj.getDate() === parseInt(day) && 
          dateObj.getMonth() === parseInt(month) - 1 && 
          dateObj.getFullYear() === parseInt(year)) {
        onChange(`${year}-${month}-${day}`);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Dia */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Dia</label>
          <Select value={currentDay} onValueChange={(day) => handleDateChange(day, undefined, undefined)}>
            <SelectTrigger className={`h-12 ${error ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {days.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mês */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Mês</label>
          <Select value={currentMonth} onValueChange={(month) => handleDateChange(undefined, month, undefined)}>
            <SelectTrigger className={`h-12 ${error ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Ano</label>
          <Select value={currentYear} onValueChange={(year) => handleDateChange(undefined, undefined, year)}>
            <SelectTrigger className={`h-12 ${error ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};