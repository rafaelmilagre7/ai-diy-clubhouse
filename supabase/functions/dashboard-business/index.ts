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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Buscar dados de negócio
    const [
      invitesResult,
      implementationRequestsResult,
      solutionCertificatesResult,
      referralsResult,
      benefitClicksResult,
      couponsResult,
      solutionsResult
    ] = await Promise.all([
      // Convites enviados
      supabase
        .from('invites')
        .select('id, status, used_at', { count: 'exact' }),
      
      // Solicitações de implementação
      supabase
        .from('implementation_requests')
        .select('id, status, created_at', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo),
      
      // Certificados emitidos
      supabase
        .from('solution_certificates')
        .select('id, issued_at', { count: 'exact' })
        .gte('issued_at', thirtyDaysAgo),
      
      // Referências
      supabase
        .from('referrals')
        .select('id, status', { count: 'exact' }),
      
      // Cliques em benefícios
      supabase
        .from('benefit_clicks')
        .select('id, clicked_at', { count: 'exact' })
        .gte('clicked_at', thirtyDaysAgo),
      
      // Cupons
      supabase
        .from('coupons')
        .select('id, used_count, is_active', { count: 'exact' }),
      
      // Soluções
      supabase
        .from('solutions')
        .select('id, category', { count: 'exact' })
    ]);

    // Calcular métricas de conversão
    const totalInvites = invitesResult.count || 0;
    const usedInvites = invitesResult.data?.filter(invite => invite.used_at).length || 0;
    const conversionRate = totalInvites > 0 ? Math.round((usedInvites / totalInvites) * 100) : 0;

    // Distribuição por categorias de soluções
    const categoryDistribution: Record<string, number> = {};
    solutionsResult.data?.forEach(solution => {
      const category = solution.category || 'Sem categoria';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    // Status das implementation requests
    const requestStatusDistribution: Record<string, number> = {};
    implementationRequestsResult.data?.forEach(request => {
      requestStatusDistribution[request.status] = (requestStatusDistribution[request.status] || 0) + 1;
    });

    // Cliques por dia nos últimos 30 dias
    const dailyClicks: Record<string, number> = {};
    benefitClicksResult.data?.forEach(click => {
      const day = click.clicked_at.split('T')[0];
      dailyClicks[day] = (dailyClicks[day] || 0) + 1;
    });

    const dashboardData = {
      conversions: {
        inviteConversionRate: conversionRate,
        totalInvites: totalInvites,
        usedInvites: usedInvites,
        pendingInvites: totalInvites - usedInvites
      },
      business: {
        implementationRequests: {
          total: implementationRequestsResult.count || 0,
          byStatus: requestStatusDistribution,
          monthly: implementationRequestsResult.count || 0
        },
        certificates: {
          issued: solutionCertificatesResult.count || 0,
          monthly: solutionCertificatesResult.count || 0
        },
        referrals: {
          total: referralsResult.count || 0,
          completed: referralsResult.data?.filter(r => r.status === 'completed').length || 0
        }
      },
      engagement: {
        benefitClicks: {
          total: benefitClicksResult.count || 0,
          monthly: benefitClicksResult.count || 0,
          daily: dailyClicks
        },
        coupons: {
          total: couponsResult.count || 0,
          active: couponsResult.data?.filter(c => c.is_active).length || 0,
          totalUsage: couponsResult.data?.reduce((sum, coupon) => sum + (coupon.used_count || 0), 0) || 0
        }
      },
      content: {
        solutions: {
          total: solutionsResult.count || 0,
          byCategory: categoryDistribution
        }
      },
      roi: {
        avgRequestsPerUser: totalInvites > 0 ? Math.round(((implementationRequestsResult.count || 0) / usedInvites) * 100) / 100 : 0,
        certificationRate: usedInvites > 0 ? Math.round(((solutionCertificatesResult.count || 0) / usedInvites) * 100) : 0,
        benefitEngagement: usedInvites > 0 ? Math.round(((benefitClicksResult.count || 0) / usedInvites) * 100) : 0
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        cacheFor: 600, // 10 minutes cache for business data
        dataRange: '30 days'
      }
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600'
      }
    });

  } catch (error) {
    console.error('Error in dashboard-business function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});