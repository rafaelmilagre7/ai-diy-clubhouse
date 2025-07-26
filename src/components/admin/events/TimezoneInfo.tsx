import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTimezoneInfo } from '@/utils/timezoneUtils';
import { Clock, MapPin, Info } from 'lucide-react';

export const TimezoneInfo = () => {
  const [timezoneInfo, setTimezoneInfo] = useState(getTimezoneInfo());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimezoneInfo(getTimezoneInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isInBrazil = timezoneInfo.userTimezone === timezoneInfo.brazilTimezone;

  return (
    <div className="p-4 surface-elevated rounded-lg border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-viverblue" />
          <span className="text-label">Horário da Plataforma</span>
          <Badge variant={isInBrazil ? "default" : "outline"} className="bg-viverblue/10 text-viverblue border-viverblue/30">
            {isInBrazil ? "Brasília" : "Convertido"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-muted hover:text-viverblue"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2 text-body-small">
        <MapPin className="h-3 w-3 text-text-muted" />
        <span className="text-text-secondary font-mono">
          {timezoneInfo.brazilTimeFormatted} (UTC{timezoneInfo.offset})
        </span>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border/30 space-y-2 text-body-small">
          <div className="text-text-muted">
            <strong>Sua localização:</strong> {timezoneInfo.userTimezone}
          </div>
          <div className="text-text-muted">
            <strong>Seu horário:</strong> {timezoneInfo.userTime}
          </div>
          <div className="text-text-muted">
            <strong>Horário da plataforma:</strong> {timezoneInfo.brazilTimeFormatted} (America/São_Paulo)
          </div>
          <div className="text-caption text-viverblue bg-viverblue/5 p-2 rounded">
            <strong>Info:</strong> Todos os eventos são exibidos no horário de Brasília, 
            independente da sua localização.
          </div>
        </div>
      )}
    </div>
  );
};