
import React, { useState, useEffect, useMemo } from 'react';
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
  // Estados internos para cada campo
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Inicializar estados internos quando value prop mudar
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDay(date.getDate().toString().padStart(2, '0'));
        setSelectedMonth((date.getMonth() + 1).toString().padStart(2, '0'));
        setSelectedYear(date.getFullYear().toString());
        console.log('[BirthDateSelector] Inicializando com valor:', value);
      }
    } else {
      setSelectedDay('');
      setSelectedMonth('');
      setSelectedYear('');
      console.log('[BirthDateSelector] Limpando valores');
    }
  }, [value]);

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

  // Função para validar e enviar data completa
  const updateParentIfComplete = (day: string, month: string, year: string) => {
    console.log('[BirthDateSelector] Verificando completude:', { day, month, year });
    
    if (day && month && year) {
      // Validar se a data é válida
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date.getDate() === parseInt(day) && 
          date.getMonth() === parseInt(month) - 1 && 
          date.getFullYear() === parseInt(year)) {
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('[BirthDateSelector] Enviando data válida:', isoDate);
        onChange(isoDate);
      } else {
        console.log('[BirthDateSelector] Data inválida detectada');
        onChange('');
      }
    } else {
      console.log('[BirthDateSelector] Data incompleta, enviando string vazia');
      onChange('');
    }
  };

  const handleDayChange = (day: string) => {
    console.log('[BirthDateSelector] Dia selecionado:', day);
    setSelectedDay(day);
    updateParentIfComplete(day, selectedMonth, selectedYear);
  };

  const handleMonthChange = (month: string) => {
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
    
    updateParentIfComplete(dayToUse, month, selectedYear);
  };

  const handleYearChange = (year: string) => {
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
    
    updateParentIfComplete(dayToUse, selectedMonth, year);
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
