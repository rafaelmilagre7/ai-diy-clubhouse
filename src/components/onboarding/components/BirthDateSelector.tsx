
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BirthDateSelectorProps {
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  onChange: (day: string, month: string, year: string) => void;
  getFieldError?: (field: string) => string | undefined;
}

const BirthDateSelector: React.FC<BirthDateSelectorProps> = memo(({
  birthDay,
  birthMonth,
  birthYear,
  onChange,
  getFieldError
}) => {
  // Estados internos para cada campo
  const [selectedDay, setSelectedDay] = useState<string>(birthDay || '');
  const [selectedMonth, setSelectedMonth] = useState<string>(birthMonth || '');
  const [selectedYear, setSelectedYear] = useState<string>(birthYear || '');

  // Sincronizar estados internos com props
  useEffect(() => {
    setSelectedDay(birthDay || '');
    setSelectedMonth(birthMonth || '');
    setSelectedYear(birthYear || '');
  }, [birthDay, birthMonth, birthYear]);

  // Gerar lista de dias baseado no mês e ano selecionados
  const days = useMemo(() => {
    const daysArray = [];
    let maxDays = 31;
    
    if (selectedMonth && selectedYear) {
      maxDays = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
    } else if (selectedMonth) {
      // Se só o mês foi selecionado, usar ano atual para calcular
      const currentYear = new Date().getFullYear();
      maxDays = new Date(currentYear, parseInt(selectedMonth), 0).getDate();
    }
    
    for (let i = 1; i <= maxDays; i++) {
      daysArray.push(i.toString().padStart(2, '0'));
    }
    return daysArray;
  }, [selectedMonth, selectedYear]);

  const months = useMemo(() => [
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
  ], []);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = [];
    for (let year = currentYear; year >= 1940; year--) {
      yearsArray.push(year.toString());
    }
    return yearsArray;
  }, []);

  const handleDayChange = useCallback((day: string) => {
    console.log('[BirthDateSelector] Dia selecionado:', day);
    setSelectedDay(day);
    onChange(day, selectedMonth, selectedYear);
  }, [onChange, selectedMonth, selectedYear]);

  const handleMonthChange = useCallback((month: string) => {
    console.log('[BirthDateSelector] Mês selecionado:', month);
    setSelectedMonth(month);
    
    // Verificar se o dia selecionado é válido para o novo mês
    let dayToUse = selectedDay;
    if (selectedDay && selectedYear) {
      const maxDaysInMonth = new Date(parseInt(selectedYear), parseInt(month), 0).getDate();
      if (parseInt(selectedDay) > maxDaysInMonth) {
        console.log('[BirthDateSelector] Ajustando dia inválido para o mês');
        dayToUse = '';
        setSelectedDay('');
      }
    }
    
    onChange(dayToUse, month, selectedYear);
  }, [onChange, selectedDay, selectedYear]);

  const handleYearChange = useCallback((year: string) => {
    console.log('[BirthDateSelector] Ano selecionado:', year);
    setSelectedYear(year);
    
    // Verificar se o dia selecionado é válido para o novo ano (anos bissextos)
    let dayToUse = selectedDay;
    if (selectedDay && selectedMonth) {
      const maxDaysInMonth = new Date(parseInt(year), parseInt(selectedMonth), 0).getDate();
      if (parseInt(selectedDay) > maxDaysInMonth) {
        console.log('[BirthDateSelector] Ajustando dia inválido para o ano');
        dayToUse = '';
        setSelectedDay('');
      }
    }
    
    onChange(dayToUse, selectedMonth, year);
  }, [onChange, selectedDay, selectedMonth]);

  // Memoizar erro
  const birthDateError = useMemo(() => getFieldError?.('birthDate'), [getFieldError]);

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
          <SelectContent className="bg-[#151823] border-white/20 z-50">
            {days.map((day) => (
              <SelectItem 
                key={`day-${day}`} 
                value={day}
                className="text-white hover:bg-white/10"
              >
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
          <SelectContent className="bg-[#151823] border-white/20 z-50">
            {months.map((month) => (
              <SelectItem 
                key={`month-${month.value}`} 
                value={month.value}
                className="text-white hover:bg-white/10"
              >
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
          <SelectContent className="bg-[#151823] border-white/20 z-50">
            {years.map((year) => (
              <SelectItem 
                key={`year-${year}`} 
                value={year}
                className="text-white hover:bg-white/10"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {birthDateError && (
        <p className="text-red-400 text-sm mt-1">{birthDateError}</p>
      )}
    </div>
  );
});

BirthDateSelector.displayName = 'BirthDateSelector';

export { BirthDateSelector };
