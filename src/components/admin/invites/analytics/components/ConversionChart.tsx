import React from 'react';
interface ChannelPerformance {
  email: {
    conversionRate: number;
    avgAcceptanceTime: number;
    cost: number;
    roi: number;
  };
  whatsapp: {
    conversionRate: number;
    avgAcceptanceTime: number;
    cost: number;
    roi: number;
  };
}
interface ConversionChartProps {
  data: ChannelPerformance;
}
export const ConversionChart: React.FC<ConversionChartProps> = ({
  data
}) => {
  const channels = [{
    name: 'Email',
    ...data.email,
    color: 'bg-blue-500'
  }, {
    name: 'WhatsApp',
    ...data.whatsapp,
    color: 'bg-green-500'
  }];
  const maxConversion = Math.max(...channels.map(c => c.conversionRate));
  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map(channel => <div key={channel.name} className="space-y-4">
            <h4 className="font-semibold text-center">{channel.name}</h4>
            
            {/* Taxa de Conversão */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Taxa de Conversão</span>
                <span className="font-bold">{channel.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`${channel.color} h-3 rounded-full transition-all duration-500`} style={{
              width: `${maxConversion > 0 ? channel.conversionRate / maxConversion * 100 : 0}%`
            }} />
              </div>
            </div>

            {/* ROI */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">ROI</span>
                <span className="font-bold">{channel.roi.toFixed(1)}x</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${channel.color} h-2 rounded-full transition-all duration-500`} style={{
              width: `${Math.min(channel.roi / 20 * 100, 100)}%`
            }} />
              </div>
            </div>

            {/* Custo */}
            <div className="text-center p-3 rounded bg-slate-900">
              <span className="text-sm text-muted-foreground">Custo por Conversão</span>
              <div className="font-bold text-lg">R$ {channel.cost.toFixed(2)}</div>
            </div>
          </div>)}
      </div>
    </div>;
};