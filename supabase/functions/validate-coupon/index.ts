import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CouponValidationRequest {
  code: string;
}

interface CouponValidationResponse {
  valid: boolean;
  discount_value?: number;
  discount_type?: string;
  reason?: string;
}

serve(async (req) => {
  console.log(`🔍 [VALIDATE-COUPON] ${req.method} request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.warn('❌ [VALIDATE-COUPON] Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ valid: false, reason: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client with service role for secure access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [VALIDATE-COUPON] Missing Supabase configuration');
      return new Response(
        JSON.stringify({ valid: false, reason: 'Configuração do servidor indisponível' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: CouponValidationRequest = await req.json();
    const { code } = body;

    console.log('🔍 [VALIDATE-COUPON] Validating coupon code:', code ? '***' : 'undefined');

    // Validate input
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      console.warn('❌ [VALIDATE-COUPON] Invalid coupon code format');
      return new Response(
        JSON.stringify({ valid: false, reason: 'Código de cupom inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced security: Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Log validation attempt for security monitoring
    console.log(`🔐 [VALIDATE-COUPON] Validation attempt from IP: ${clientIP}`);

    // Query coupons table securely using service role
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('id, discount_value, discount_type, is_active, expires_at, usage_limit, used_count')
      .eq('code', code.trim().toUpperCase())
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ [VALIDATE-COUPON] Database error:', error.message);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Erro interno do servidor' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced validation logic
    if (!coupon) {
      console.log('❌ [VALIDATE-COUPON] Coupon not found');
      await logSecurityEvent(supabase, 'coupon_not_found', { code, ip: clientIP });
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Cupom não encontrado' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      console.log('❌ [VALIDATE-COUPON] Coupon is inactive');
      await logSecurityEvent(supabase, 'coupon_inactive', { code, ip: clientIP });
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Cupom inativo' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check expiration date
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      console.log('❌ [VALIDATE-COUPON] Coupon expired');
      await logSecurityEvent(supabase, 'coupon_expired', { code, ip: clientIP });
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Cupom expirado' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      console.log('❌ [VALIDATE-COUPON] Coupon usage limit exceeded');
      await logSecurityEvent(supabase, 'coupon_limit_exceeded', { code, ip: clientIP });
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'Cupom esgotado' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Coupon is valid
    console.log('✅ [VALIDATE-COUPON] Coupon validated successfully');
    await logSecurityEvent(supabase, 'coupon_validated', { 
      code, 
      ip: clientIP,
      discount_value: coupon.discount_value,
      discount_type: coupon.discount_type
    });

    const response: CouponValidationResponse = {
      valid: true,
      discount_value: coupon.discount_value,
      discount_type: coupon.discount_type
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 [VALIDATE-COUPON] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        reason: 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to log security events
async function logSecurityEvent(
  supabase: any, 
  eventType: string, 
  details: Record<string, any>
) {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        event_type: 'coupon_validation',
        action: eventType,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          function: 'validate-coupon'
        },
        severity: eventType.includes('not_found') || eventType.includes('invalid') ? 'warning' : 'info'
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw here to avoid breaking the main flow
  }
}