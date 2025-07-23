import React, { useState, useEffect } from 'react';
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
  // Estados locais para cada campo
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Parse do valor inicial quando o componente é montado
  useEffect(() => {
    if (value && value.includes('-') && value.length === 10) {
      const currentDate = new Date(value);
      if (!isNaN(currentDate.getTime())) {
        setSelectedDay(currentDate.getDate().toString().padStart(2, '0'));
        setSelectedMonth((currentDate.getMonth() + 1).toString().padStart(2, '0'));
        setSelectedYear(currentDate.getFullYear().toString());
      }
    }
  }, [value]);

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

  // Função para atualizar uma data completa quando todos os campos estão preenchidos
  const updateCompleteDate = (day: string, month: string, year: string) => {
    if (day && month && year) {
      // Validar se a data é válida
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (dateObj.getDate() === parseInt(day) && 
          dateObj.getMonth() === parseInt(month) - 1 && 
          dateObj.getFullYear() === parseInt(year)) {
        onChange(`${year}-${month}-${day}`);
        console.log('Data completa selecionada:', `${year}-${month}-${day}`);
      }
    }
  };

  const handleDayChange = (day: string) => {
    console.log('Dia selecionado:', day);
    setSelectedDay(day);
    updateCompleteDate(day, selectedMonth, selectedYear);
  };

  const handleMonthChange = (month: string) => {
    console.log('Mês selecionado:', month);
    setSelectedMonth(month);
    updateCompleteDate(selectedDay, month, selectedYear);
  };

  const handleYearChange = (year: string) => {
    console.log('Ano selecionado:', year);
    setSelectedYear(year);
    updateCompleteDate(selectedDay, selectedMonth, year);
  };

  return (
    <div className="space-y-2">
      {selectedDay && selectedMonth && selectedYear && (
        <p className="text-sm text-muted-foreground">
          Data selecionada: {selectedDay}/{selectedMonth}/{selectedYear}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {/* Dia */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Dia</label>
          <Select value={selectedDay} onValueChange={handleDayChange}>
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
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
          <Select value={selectedYear} onValueChange={handleYearChange}>
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