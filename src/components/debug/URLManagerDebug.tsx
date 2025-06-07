
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Trash2, Activity, BarChart3, Settings } from 'lucide-react';
import { urlManager } from '@/services/urlManager';
import { useCertificateURL } from '@/hooks/useCertificateURL';
import { PROXY_CONFIG } from '@/config/proxyConfig';

export const URLManagerDebug = () => {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { getURLStats, clearCertificateCache } = useCertificateURL();

  // Só mostrar em desenvolvimento ou para admins
  useEffect(() => {
    const isDev = import.meta.env.DEV;
    const isAdmin = localStorage.getItem('user_role') === 'admin';
    setIsVisible(isDev || isAdmin);
  }, []);

  const refreshStats = () => {
    const urlStats = getURLStats();
    setStats({
      ...urlStats,
      config: PROXY_CONFIG,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    if (isVisible) {
      refreshStats();
      const interval = setInterval(refreshStats, 5000); // Atualizar a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible || !stats) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-hidden z-50 bg-black/90 border-viverblue/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between text-viverblue">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            URL Manager Debug
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={refreshStats}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearCertificateCache}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        <Tabs defaultValue="cache" className="h-64">
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="cache" className="text-xs">Cache</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
            <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cache" className="space-y-2 overflow-y-auto h-48">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Cache Size:</span>
              <Badge variant="outline" className="text-xs">
                {stats.cache?.size || 0} items
              </Badge>
            </div>
            
            <div className="space-y-1">
              {stats.cache?.items?.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                  <div className="font-mono text-green-400 truncate">
                    {item.key}
                  </div>
                  <div className="text-gray-500">
                    Age: {Math.floor(item.age / 1000)}s
                  </div>
                </div>
              )) || <div className="text-xs text-gray-500">Cache vazio</div>}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-2 overflow-y-auto h-48">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Transforming</div>
                <div className="text-white font-bold">
                  {stats.isTransforming ? 'Yes' : 'No'}
                </div>
              </div>
              
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Last Update</div>
                <div className="text-white font-bold">
                  {stats.timestamp}
                </div>
              </div>
            </div>
            
            {stats.lastTransformation && (
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400 text-xs mb-1">Last Transformation</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs">Source:</span>
                    <Badge variant={stats.lastTransformation.source === 'proxy' ? 'default' : 'secondary'} className="text-xs">
                      {stats.lastTransformation.source}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Cached:</span>
                    <Badge variant={stats.lastTransformation.cached ? 'default' : 'secondary'} className="text-xs">
                      {stats.lastTransformation.cached ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="config" className="space-y-2 overflow-y-auto h-48">
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Base URL</div>
                <div className="text-white font-mono text-xs truncate">
                  {stats.config?.baseUrl}
                </div>
              </div>
              
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400 mb-1">Endpoints</div>
                <div className="space-y-1">
                  {Object.entries(stats.config?.endpoints || {}).map(([key, endpoint]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-white">{key}</span>
                      <span className="text-gray-400">{endpoint.cacheTTL}s</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-800 rounded">
                  <div className="text-gray-400">Cache</div>
                  <Badge variant={stats.config?.cache?.enabled ? 'default' : 'secondary'} className="text-xs">
                    {stats.config?.cache?.enabled ? 'On' : 'Off'}
                  </Badge>
                </div>
                
                <div className="p-2 bg-gray-800 rounded">
                  <div className="text-gray-400">Analytics</div>
                  <Badge variant={stats.config?.analytics?.enabled ? 'default' : 'secondary'} className="text-xs">
                    {stats.config?.analytics?.enabled ? 'On' : 'Off'}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
