
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BirthDateSelectorProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  getFieldError?: (field: string) => string | undefined;
}

export const BirthDateSelector: React.FC<BirthDateSelectorProps> = ({
  value,
  onChange,
  getFieldError
}) => {
  // Parse current value
  const currentDate = value ? new Date(value) : null;
  const selectedDay = currentDate?.getDate().toString() || '';
  const selectedMonth = currentDate ? (currentDate.getMonth() + 1).toString() : '';
  const selectedYear = currentDate?.getFullYear().toString() || '';

  // Generate options
  const days = useMemo(() => {
    const daysArray = [];
    const maxDays = selectedMonth && selectedYear ? 
      new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate() : 31;
    
    for (let i = 1; i <= maxDays; i++) {
      daysArray.push(i.toString().padStart(2, '0'));
    }
    return daysArray;
  }, [selectedMonth, selectedYear]);

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
    { value: '12', label: 'Dezembro' }
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = [];
    for (let year = currentYear; year >= 1940; year--) {
      yearsArray.push(year.toString());
    }
    return yearsArray;
  }, []);

  // Handle changes
  const handleDateChange = (day: string, month: string, year: string) => {
    if (day && month && year) {
      // Validate date exists
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date.getDate() === parseInt(day)) {
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        onChange(isoDate);
      }
    } else {
      onChange('');
    }
  };

  const handleDayChange = (day: string) => {
    handleDateChange(day, selectedMonth, selectedYear);
  };

  const handleMonthChange = (month: string) => {
    // If selected day is invalid for new month, clear it
    const maxDaysInMonth = new Date(parseInt(selectedYear) || 2024, parseInt(month), 0).getDate();
    const dayToUse = selectedDay && parseInt(selectedDay) <= maxDaysInMonth ? selectedDay : '';
    handleDateChange(dayToUse, month, selectedYear);
  };

  const handleYearChange = (year: string) => {
    // Check if current day/month is valid for new year (leap year check)
    const maxDaysInMonth = selectedMonth ? 
      new Date(parseInt(year), parseInt(selectedMonth), 0).getDate() : 31;
    const dayToUse = selectedDay && parseInt(selectedDay) <= maxDaysInMonth ? selectedDay : '';
    handleDateChange(dayToUse, selectedMonth, year);
  };

  return (
    <div>
      <Label className="text-slate-200">
        Data de Nascimento *
      </Label>
      
      <div className="grid grid-cols-3 gap-2 mt-1">
        {/* Dia */}
        <Select value={selectedDay} onValueChange={handleDayChange}>
          <SelectTrigger className="bg-[#151823] border-white/20 text-white">
            <SelectValue placeholder="Dia" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mês */}
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="bg-[#151823] border-white/20 text-white">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ano */}
        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger className="bg-[#151823] border-white/20 text-white">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {getFieldError?.('birthDate') && (
        <p className="text-red-400 text-sm mt-1">{getFieldError('birthDate')}</p>
      )}
    </div>
  );
};
