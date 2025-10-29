import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * 🔍 COMPONENTE DE DIAGNÓSTICO DE ROTEAMENTO
 * 
 * Este componente monitora e exibe informações sobre o estado do roteamento
 * para ajudar a diagnosticar problemas de navegação no preview/sandbox.
 */
export const RouteDebugger = () => {
  const location = useLocation();
  const [routeHistory, setRouteHistory] = useState<string[]>([]);
  const [windowLocation, setWindowLocation] = useState<string>('');
  const [isSandbox, setIsSandbox] = useState(false);
  
  // Atualizar informações quando a rota mudar
  useEffect(() => {
    // Verificar se estamos em um iframe (sandbox)
    const inIframe = window.self !== window.top;
    setIsSandbox(inIframe);
    
    // Capturar window.location.pathname
    setWindowLocation(window.location.pathname);
    
    // Adicionar ao histórico
    setRouteHistory(prev => {
      const newHistory = [...prev, location.pathname];
      // Manter apenas os últimos 10
      return newHistory.slice(-10);
    });
    
    // Log detalhado no console
    console.group('🔍 [ROUTE-DEBUG] Mudança de Rota');
    console.log('📍 React Router pathname:', location.pathname);
    console.log('🌐 Window pathname:', window.location.pathname);
    console.log('🔗 Window href:', window.location.href);
    console.log('📦 Em iframe/sandbox:', inIframe);
    console.log('🔄 Estado:', location.state);
    console.log('❓ Query:', location.search);
    console.groupEnd();
  }, [location]);
  
  const handleCopyInfo = () => {
    const info = `
=== DIAGNÓSTICO DE ROTEAMENTO ===
React Router pathname: ${location.pathname}
Window pathname: ${window.location.pathname}
Window href: ${window.location.href}
Em sandbox/iframe: ${isSandbox}
Histórico: ${routeHistory.join(' → ')}
    `.trim();
    
    navigator.clipboard.writeText(info);
    console.log('✅ Informações copiadas!');
  };
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🔍 Route Debugger
          <Badge variant={isSandbox ? "secondary" : "default"}>
            {isSandbox ? "Sandbox" : "Normal"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Diagnóstico de roteamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>React Router:</strong>
          <div className="bg-muted p-2 rounded mt-1 font-mono break-all">
            {location.pathname}
          </div>
        </div>
        
        <div>
          <strong>Window Location:</strong>
          <div className="bg-muted p-2 rounded mt-1 font-mono break-all">
            {windowLocation}
          </div>
        </div>
        
        <div>
          <strong>Histórico (últimas 10):</strong>
          <div className="bg-muted p-2 rounded mt-1 space-y-1 max-h-32 overflow-y-auto">
            {routeHistory.length === 0 ? (
              <span className="text-muted-foreground">Nenhuma navegação ainda</span>
            ) : (
              routeHistory.map((route, idx) => (
                <div key={idx} className="font-mono text-xs">
                  {idx + 1}. {route}
                </div>
              ))
            )}
          </div>
        </div>
        
        {location.pathname !== windowLocation && (
          <div className="bg-destructive/10 border border-destructive/30 p-2 rounded">
            <strong className="text-destructive">⚠️ Discrepância detectada!</strong>
            <p className="text-xs mt-1">
              React Router e Window Location não estão sincronizados
            </p>
          </div>
        )}
        
        <Button onClick={handleCopyInfo} size="sm" className="w-full mt-2">
          Copiar Diagnóstico
        </Button>
      </CardContent>
    </Card>
  );
};