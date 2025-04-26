
import React from 'react';
import AppRoutes from '@/components/routing/AppRoutes';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

// Componente otimizado para prefetch de dados durante navegação
const AppRoutesWrapper = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { user } = useAuth();
  
  // Prefetch agressivo baseado na rota atual
  useEffect(() => {
    // Prefetch de dados importantes usado em múltiplas páginas
    const prefetchCommonData = () => {
      // Prefetch de soluções - usado em várias páginas
      queryClient.prefetchQuery({
        queryKey: ['solutions'],
        queryFn: async () => {
          // Apenas buscar se não tiver em cache
          if (!queryClient.getQueryData(['solutions'])) {
            const { supabase } = await import('@/lib/supabase');
            const { data } = await supabase
              .from('solutions')
              .select('*')
              .eq('published', true);
            return data;
          }
          return queryClient.getQueryData(['solutions']);
        },
        staleTime: 5 * 60 * 1000 // 5 minutos
      });
    };

    // Prefetch de dados específicos por rota
    const prefetchRouteData = () => {
      if (location.pathname.includes('/dashboard')) {
        // Prefetch para dashboard
        queryClient.prefetchQuery({
          queryKey: ['progress'],
          queryFn: async () => {
            // Somente se não já estiver em cache
            const { supabase } = await import('@/lib/supabase');
            if (!user) return null;
            
            const { data } = await supabase
              .from('progress')
              .select('*')
              .eq('user_id', user.id);
            return data;
          },
          staleTime: 1 * 60 * 1000 // 1 minuto
        });
      }
      
      if (location.pathname.includes('/implementation-trail')) {
        // Prefetch para trilha
        queryClient.prefetchQuery({
          queryKey: ['implementation-trail'],
          queryFn: async () => {
            // Implementar prefetch para trilha se necessário
            return null;
          },
          staleTime: 1 * 60 * 1000 // 1 minuto
        });
      }
      
      // Adicionar mais prefetches específicos de rota conforme necessário
    };
    
    prefetchCommonData();
    prefetchRouteData();
  }, [location.pathname, queryClient, user]);
  
  // Renderizar rotas imediatamente - sem loading global
  return <AppRoutes />;
};

export default AppRoutesWrapper;
