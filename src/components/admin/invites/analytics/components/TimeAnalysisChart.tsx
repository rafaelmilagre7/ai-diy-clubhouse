
import React from 'react';

interface TimeAnalysisChartProps {
  data: number[];
}

export const TimeAnalysisChart: React.FC<TimeAnalysisChartProps> = ({ data }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxValue = Math.max(...data);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {hours.map((hour) => {
          const isOptimal = data.includes(hour);
          const intensity = isOptimal ? 'high' : 'low';
          
          return (
            <div key={hour} className="text-center space-y-1">
              <div className="text-xs text-muted-foreground">
                {hour.toString().padStart(2, '0')}h
              </div>
              <div 
                className={`h-8 rounded ${
                  intensity === 'high' 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                } transition-all duration-300`}
                title={`${hour}:00 - ${isOptimal ? 'Horário ótimo' : 'Horário regular'}`}
              />
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Horários ótimos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>Outros horários</span>
        </div>
      </div>
    </div>
  );
};
