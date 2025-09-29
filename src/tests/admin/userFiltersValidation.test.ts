/**
 * Testes de validação para os filtros de usuários
 * Valida se cada filtro retorna os dados corretos comparando com queries diretas no banco
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Validação dos Filtros de Usuários', () => {
  let isAdmin = false;

  beforeAll(async () => {
    // Verificar se o usuário atual é admin para executar os testes
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select(`
          user_roles!inner(
            name
          )
        `)
        .eq('id', user.id)
        .single();
      
      isAdmin = (data?.user_roles as any)?.name === 'admin';
    }
  });

  it('deve validar o filtro "all" retornando todos os usuários', async () => {
    if (!isAdmin) {
      console.log('⚠️ Teste pulado - usuário não é admin');
      return;
    }

    // Buscar através da função RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_users_with_filters_public', {
      p_limit: 1000,
      p_offset: 0,
      p_search: null,
      p_user_type: null
    });

    expect(rpcError).toBeNull();
    expect(rpcData).toBeDefined();

    // Buscar através de query direta
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: false });

    expect(directError).toBeNull();
    expect(directData).toBeDefined();

    // Validar se a contagem está correta
    const rpcCount = rpcData?.[0]?.total_count || 0;
    const directCount = directData?.length || 0;

    console.log(`🔍 Filtro "all": RPC=${rpcCount}, Direto=${directCount}`);
    expect(rpcCount).toBe(directCount);
  });

  it('deve validar o filtro "master" retornando apenas masters', async () => {
    if (!isAdmin) {
      console.log('⚠️ Teste pulado - usuário não é admin');
      return;
    }

    // Buscar através da função RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_users_with_filters_public', {
      p_limit: 1000,
      p_offset: 0,
      p_search: null,
      p_user_type: 'master'
    });

    expect(rpcError).toBeNull();
    expect(rpcData).toBeDefined();

    // Buscar através de query direta
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .select('id, is_master_user')
      .eq('is_master_user', true);

    expect(directError).toBeNull();
    expect(directData).toBeDefined();

    // Validar se todos os usuários retornados são masters
    rpcData?.forEach(user => {
      expect(user.is_master_user).toBe(true);
    });

    const rpcCount = rpcData?.length || 0;
    const directCount = directData?.length || 0;

    console.log(`👑 Filtro "master": RPC=${rpcCount}, Direto=${directCount}`);
    expect(rpcCount).toBe(directCount);
  });

  it('deve validar o filtro "individual" retornando apenas usuários individuais', async () => {
    if (!isAdmin) {
      console.log('⚠️ Teste pulado - usuário não é admin');
      return;
    }

    // Buscar através da função RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_users_with_filters_public', {
      p_limit: 1000,
      p_offset: 0,
      p_search: null,
      p_user_type: 'individual'
    });

    expect(rpcError).toBeNull();
    expect(rpcData).toBeDefined();

    // Buscar através de query direta
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .select('id, is_master_user')
      .or('is_master_user.eq.false,is_master_user.is.null');

    expect(directError).toBeNull();
    expect(directData).toBeDefined();

    // Validar se nenhum usuário retornado é master
    rpcData?.forEach(user => {
      expect(user.is_master_user).not.toBe(true);
    });

    const rpcCount = rpcData?.length || 0;
    const directCount = directData?.length || 0;

    console.log(`👤 Filtro "individual": RPC=${rpcCount}, Direto=${directCount}`);
    expect(rpcCount).toBe(directCount);
  });

  it('deve validar o filtro "onboarding_completed"', async () => {
    if (!isAdmin) {
      console.log('⚠️ Teste pulado - usuário não é admin');
      return;
    }

    // Buscar através da função RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_users_with_filters_public', {
      p_limit: 1000,
      p_offset: 0,
      p_search: null,
      p_user_type: 'onboarding_completed'
    });

    expect(rpcError).toBeNull();
    expect(rpcData).toBeDefined();

    // Buscar através de query direta
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .eq('onboarding_completed', true);

    expect(directError).toBeNull();
    expect(directData).toBeDefined();

    // Validar se todos os usuários retornados têm onboarding completo
    rpcData?.forEach(user => {
      expect(user.onboarding_completed).toBe(true);
    });

    const rpcCount = rpcData?.length || 0;
    const directCount = directData?.length || 0;

    console.log(`✅ Filtro "onboarding_completed": RPC=${rpcCount}, Direto=${directCount}`);
    expect(rpcCount).toBe(directCount);
  });

  it('deve validar o filtro "onboarding_pending"', async () => {
    if (!isAdmin) {
      console.log('⚠️ Teste pulado - usuário não é admin');
      return;
    }

    // Buscar através da função RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_users_with_filters_public', {
      p_limit: 1000,
      p_offset: 0,
      p_search: null,
      p_user_type: 'onboarding_pending'
    });

    expect(rpcError).toBeNull();
    expect(rpcData).toBeDefined();

    // Buscar através de query direta
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .or('onboarding_completed.eq.false,onboarding_completed.is.null');

    expect(directError).toBeNull();
    expect(directData).toBeDefined();

    // Validar se nenhum usuário retornado tem onboarding completo
    rpcData?.forEach(user => {
      expect(user.onboarding_completed).not.toBe(true);
    });

    const rpcCount = rpcData?.length || 0;
    const directCount = directData?.length || 0;

    console.log(`⏳ Filtro "onboarding_pending": RPC=${rpcCount}, Direto=${directCount}`);
    expect(rpcCount).toBe(directCount);
  });

  it('deve validar as estatísticas simplificadas', async () => {
    if (!isAdmin) {
      console.log('⚠️ Teste pulado - usuário não é admin');
      return;
    }

    // Buscar através da função RPC
    const { data: statsData, error: statsError } = await supabase.rpc('get_simplified_user_stats_public');

    expect(statsError).toBeNull();
    expect(statsData).toBeDefined();

    // Validar através de queries diretas
    const { data: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    const { data: masters } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('is_master_user', true);

    const { data: individual } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .or('is_master_user.eq.false,is_master_user.is.null');

    const { data: completed } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('onboarding_completed', true);

    const { data: pending } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .or('onboarding_completed.eq.false,onboarding_completed.is.null');

    console.log('📊 Validação das Estatísticas:');
    console.log(`Total: RPC=${statsData.total_users}, Direto=${totalUsers?.length}`);
    console.log(`Masters: RPC=${statsData.masters}, Direto=${masters?.length}`);
    console.log(`Individual: RPC=${statsData.individual_users}, Direto=${individual?.length}`);
    console.log(`Completo: RPC=${statsData.onboarding_completed}, Direto=${completed?.length}`);
    console.log(`Pendente: RPC=${statsData.onboarding_pending}, Direto=${pending?.length}`);

    // Validar contagens
    expect(statsData.total_users).toBe(totalUsers?.length || 0);
    expect(statsData.masters).toBe(masters?.length || 0);
    expect(statsData.individual_users).toBe(individual?.length || 0);
    expect(statsData.onboarding_completed).toBe(completed?.length || 0);
    expect(statsData.onboarding_pending).toBe(pending?.length || 0);
  });
});