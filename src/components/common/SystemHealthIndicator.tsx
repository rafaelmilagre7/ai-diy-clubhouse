
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Shield, 
  ShieldAlert, 
  ShieldX, 
  RefreshCw,
  Database,
  Lock,
  HardDrive
} from 'lucide-react';

export const SystemHealthIndicator = () => {
  const { healthStatus, isChecking, checkSystemHealth } = useSystemHealth();

  const getStatusIcon = () => {
    switch (healthStatus.overall) {
      case 'healthy':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <ShieldX className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus.overall) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs">Sistema</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkSystemHealth}
              disabled={isChecking}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">Status do Sistema</div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Database className="h-3 w-3" />
                <span>Banco de Dados:</span>
                <div className={`w-2 h-2 rounded-full ${healthStatus.database ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Lock className="h-3 w-3" />
                <span>Autenticação:</span>
                <div className={`w-2 h-2 rounded-full ${healthStatus.authentication ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <HardDrive className="h-3 w-3" />
                <span>Armazenamento:</span>
                <div className={`w-2 h-2 rounded-full ${healthStatus.storage ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>

            {healthStatus.errors.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs font-semibold text-red-600">Erros:</div>
                <ul className="text-xs space-y-1 mt-1">
                  {healthStatus.errors.slice(0, 3).map((error, index) => (
                    <li key={index} className="text-red-600">• {error}</li>
                  ))}
                  {healthStatus.errors.length > 3 && (
                    <li className="text-gray-500">... e mais {healthStatus.errors.length - 3}</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              Última verificação: {healthStatus.lastChecked.toLocaleTimeString()}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
