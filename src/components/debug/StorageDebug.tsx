
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Trash2, Activity, BarChart3, Image, FileText, HardDrive } from 'lucide-react';
import { storageUrlManager } from '@/services/storageUrlManager';
import { useImageURL } from '@/hooks/useImageURL';
import { useDocumentURL } from '@/hooks/useDocumentURL';
import { useStorageURL } from '@/hooks/useStorageURL';

export const StorageDebug = () => {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { clearImageCache } = useImageURL();
  const { clearDocumentCache } = useDocumentURL();
  const { clearStorageCache, getStorageStats } = useStorageURL();

  // Só mostrar em desenvolvimento ou para admins
  useEffect(() => {
    const isDev = import.meta.env.DEV;
    const isAdmin = localStorage.getItem('user_role') === 'admin';
    setIsVisible(isDev || isAdmin);
  }, []);

  const refreshStats = () => {
    const storageStats = getStorageStats();
    setStats({
      ...storageStats,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    if (isVisible) {
      refreshStats();
      const interval = setInterval(refreshStats, 10000); // Atualizar a cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const clearAllCaches = () => {
    clearImageCache();
    clearDocumentCache();
    clearStorageCache();
    refreshStats();
  };

  if (!isVisible || !stats) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 w-96 max-h-96 overflow-hidden z-50 bg-black/90 border-viverblue/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between text-viverblue">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Storage Debug
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={refreshStats}
              className="h-6 w-6 p-0"
              title="Atualizar estatísticas"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearAllCaches}
              className="h-6 w-6 p-0"
              title="Limpar todos os caches"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        <Tabs defaultValue="overview" className="h-64">
          <TabsList className="grid w-full grid-cols-4 mb-2">
            <TabsTrigger value="overview" className="text-xs">
              <BarChart3 className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              <Image className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs">
              <FileText className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="storage" className="text-xs">
              <HardDrive className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-2 overflow-y-auto h-48">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Cache Total</div>
                <div className="text-white font-bold">
                  {stats.cache?.size || 0} items
                </div>
              </div>
              
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Última Atualização</div>
                <div className="text-white font-bold text-xs">
                  {stats.timestamp}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-medium">Cache Recente:</div>
              {stats.cache?.items?.slice(0, 4).map((item: any, index: number) => {
                const [type] = item.key.split(':');
                const typeColors = {
                  image: 'text-green-400',
                  document: 'text-blue-400',
                  storage: 'text-purple-400',
                  certificate: 'text-orange-400'
                };
                
                return (
                  <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                    <div className={`font-mono truncate ${typeColors[type] || 'text-gray-400'}`}>
                      {type}: {item.key.split(':')[1]?.substring(0, 30)}...
                    </div>
                    <div className="text-gray-500">
                      Age: {Math.floor(item.age / 1000)}s
                    </div>
                  </div>
                );
              }) || <div className="text-xs text-gray-500">Cache vazio</div>}
            </div>
          </TabsContent>
          
          <TabsContent value="images" className="space-y-2 overflow-y-auto h-48">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">URLs de Imagens</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearImageCache}
                className="h-5 text-xs px-2"
              >
                Limpar
              </Button>
            </div>
            
            <div className="space-y-1">
              {stats.cache?.items?.filter((item: any) => item.key.startsWith('image:')).map((item: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                  <div className="font-mono text-green-400 truncate">
                    {item.key.replace('image:', '').substring(0, 40)}...
                  </div>
                  <div className="text-gray-500">
                    Age: {Math.floor(item.age / 1000)}s
                  </div>
                </div>
              )) || <div className="text-xs text-gray-500">Nenhuma imagem em cache</div>}
            </div>
          </TabsContent>
          
          <TabsContent value="docs" className="space-y-2 overflow-y-auto h-48">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">URLs de Documentos</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearDocumentCache}
                className="h-5 text-xs px-2"
              >
                Limpar
              </Button>
            </div>
            
            <div className="space-y-1">
              {stats.cache?.items?.filter((item: any) => item.key.startsWith('document:')).map((item: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                  <div className="font-mono text-blue-400 truncate">
                    {item.key.replace('document:', '').substring(0, 40)}...
                  </div>
                  <div className="text-gray-500">
                    Age: {Math.floor(item.age / 1000)}s
                  </div>
                </div>
              )) || <div className="text-xs text-gray-500">Nenhum documento em cache</div>}
            </div>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-2 overflow-y-auto h-48">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">URLs de Storage</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearStorageCache}
                className="h-5 text-xs px-2"
              >
                Limpar
              </Button>
            </div>
            
            <div className="space-y-1">
              {stats.cache?.items?.filter((item: any) => item.key.startsWith('storage:')).map((item: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                  <div className="font-mono text-purple-400 truncate">
                    {item.key.replace('storage:', '').substring(0, 40)}...
                  </div>
                  <div className="text-gray-500">
                    Age: {Math.floor(item.age / 1000)}s
                  </div>
                </div>
              )) || <div className="text-xs text-gray-500">Nenhum arquivo em cache</div>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
