import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Verificar se é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, user_roles(*)')
      .eq('id', user.id)
      .single();

    if (!profile?.user_roles?.name || profile.user_roles.name !== 'admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    // Buscar dados de usuários
    const [
      totalUsersResult,
      activeUsersResult,
      newUsersResult,
      onboardingResult,
      rolesDistributionResult
    ] = await Promise.all([
      // Total de usuários
      supabase.from('profiles').select('id', { count: 'exact' }),
      
      // Usuários ativos (últimos 30 dias)
      supabase
        .from('analytics')
        .select('user_id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Novos usuários (últimos 30 dias)
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Status de onboarding
      supabase
        .from('profiles')
        .select('onboarding_completed', { count: 'exact' })
        .eq('onboarding_completed', true),
      
      // Distribuição por roles
      supabase
        .from('profiles')
        .select('user_roles(name)', { count: 'exact' })
    ]);

    // Buscar crescimento mensal dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: growthData } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at');

    // Processar dados de crescimento por mês
    const monthlyGrowth = {};
    growthData?.forEach(user => {
      const month = new Date(user.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
    });

    const dashboardData = {
      metrics: {
        totalUsers: totalUsersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        newUsers: newUsersResult.count || 0,
        onboardingCompleted: onboardingResult.count || 0,
        onboardingRate: totalUsersResult.count > 0 
          ? Math.round((onboardingResult.count / totalUsersResult.count) * 100) 
          : 0
      },
      growth: {
        monthly: monthlyGrowth,
        trend: Object.values(monthlyGrowth).length > 1 
          ? 'growth' 
          : 'stable'
      },
      segmentation: {
        byRole: rolesDistributionResult.data || [],
        byOnboarding: {
          completed: onboardingResult.count || 0,
          pending: (totalUsersResult.count || 0) - (onboardingResult.count || 0)
        }
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        cacheFor: 300, // 5 minutes
        dataRange: '30 days'
      }
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });

  } catch (error) {
    console.error('Error in dashboard-users function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});