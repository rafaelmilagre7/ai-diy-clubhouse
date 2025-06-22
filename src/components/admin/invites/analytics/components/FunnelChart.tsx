
import React from 'react';

interface FunnelData {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  registered: number;
  active: number;
}

interface FunnelChartProps {
  data: FunnelData;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const stages = [
    { name: 'Enviados', value: data.sent, color: 'bg-blue-500' },
    { name: 'Entregues', value: data.delivered, color: 'bg-green-500' },
    { name: 'Abertos', value: data.opened, color: 'bg-yellow-500' },
    { name: 'Clicados', value: data.clicked, color: 'bg-orange-500' },
    { name: 'Cadastrados', value: data.registered, color: 'bg-purple-500' },
    { name: 'Ativos', value: data.active, color: 'bg-pink-500' }
  ];

  const maxValue = Math.max(...stages.map(s => s.value));

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
        const conversionRate = index > 0 
          ? stages[index - 1].value > 0 
            ? ((stage.value / stages[index - 1].value) * 100).toFixed(1)
            : '0.0'
          : '100.0';

        return (
          <div key={stage.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{stage.name}</span>
              <div className="text-right">
                <span className="font-bold">{stage.value.toLocaleString()}</span>
                {index > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({conversionRate}%)
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 relative">
              <div 
                className={`${stage.color} h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium`}
                style={{ width: `${Math.max(width, 5)}%` }}
              >
                {width > 20 && stage.value.toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
