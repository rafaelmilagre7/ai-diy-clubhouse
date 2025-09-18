import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const ProfileDebugPanel = () => {
  const { profile, user, session, isAdmin, isLoading } = useAuth();
  const [freshProfile, setFreshProfile] = useState<any>(null);
  const [dbCheck, setDbCheck] = useState<any>(null);

  const runDebugCheck = async () => {
    console.group('🔍 [DEBUG PROFILE] Diagnóstico Completo');
    
    // 1. Estado atual do contexto
    console.log('1️⃣ ESTADO DO CONTEXTO AUTH:', {
      hasSession: !!session,
      hasUser: !!user,
      hasProfile: !!profile,
      isLoading,
      isAdmin,
      userEmail: user?.email,
      userId: user?.id,
      profile: profile
    });

    // 2. Buscar profile fresco do banco
    if (user?.id) {
      try {
        const { data: freshProfileData, error } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles (
              id,
              name,
              description,
              permissions
            )
          `)
          .eq('id', user.id)
          .single();

        console.log('2️⃣ PROFILE FRESCO DO BANCO:', {
          data: freshProfileData,
          error,
          role_id: freshProfileData?.role_id,
          role_id_type: typeof freshProfileData?.role_id
        });

        setFreshProfile(freshProfileData);

        // 3. Verificar na tabela user_roles diretamente
        if (freshProfileData?.role_id) {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('id', freshProfileData.role_id)
            .single();

          console.log('3️⃣ VERIFICAÇÃO DIRETA DA ROLE:', {
            roleId: freshProfileData.role_id,
            roleData,
            roleError
          });

          setDbCheck(roleData);
        }

      } catch (error) {
        console.error('❌ ERRO na busca:', error);
      }
    }

    console.groupEnd();
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="font-bold mb-2 text-sm">🔍 Profile Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Email:</strong> {user?.email || 'N/A'}
        </div>
        <div>
          <strong>Profile Role ID:</strong> {profile?.role_id || 'AUSENTE!'}
        </div>
        <div>
          <strong>Is Admin:</strong> {isAdmin ? '✅' : '❌'}
        </div>
        <div>
          <strong>Loading:</strong> {isLoading ? '⏳' : '✅'}
        </div>
      </div>

      <Button 
        onClick={runDebugCheck}
        size="sm" 
        className="mt-2 w-full"
      >
        🔍 Debug Completo
      </Button>

      {freshProfile && (
        <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong>Fresh Role ID:</strong> {freshProfile.role_id}
        </div>
      )}
    </div>
  );
};