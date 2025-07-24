
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

// Configuração do rate limiting - AJUSTADO para permitir convites
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 10, // Aumentado de 5 para 10
  WINDOW_MINUTES: 15, // Aumentado de 10 para 15 minutos
  PROGRESSIVE_BLOCKS: [30000, 120000, 600000], // Reduzido: 30s, 2min, 10min
  JITTER_MAX: 500, // máximo 500ms de jitter
  CLEANUP_INTERVAL: 86400000 // 24h em ms
}

// CORREÇÃO DE SEGURANÇA: Validar entradas
function validateAuthInput(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Dados de autenticação inválidos' };
  }
  
  if (!data.email || typeof data.email !== 'string') {
    return { isValid: false, error: 'Email é obrigatório e deve ser uma string' };
  }
  
  if (!data.password || typeof data.password !== 'string') {
    return { isValid: false, error: 'Senha é obrigatória e deve ser uma string' };
  }
  
  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  // Validar comprimento mínimo da senha
  if (data.password.length < 6) {
    return { isValid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  }
  
  return { isValid: true };
}

// Função para criar identificador seguro (hash do IP + email)
function createSecureIdentifier(ip: string, email: string): string {
  const data = `${ip}:${email.toLowerCase()}`
  // Criar hash simples para privacidade
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Função para adicionar jitter aleatório
function addJitter(): number {
  return Math.random() * RATE_LIMIT_CONFIG.JITTER_MAX
}

// Função para verificar e aplicar rate limiting usando tabela persistente
async function checkRateLimit(supabase: any, identifier: string, config = RATE_LIMIT_CONFIG): Promise<{
  allowed: boolean;
  reason?: string;
  waitTime?: number;
  remaining?: number;
}> {
  const now = Date.now()
  const windowStart = now - (config.WINDOW_MINUTES * 60 * 1000)
  
  try {
    // Buscar entrada existente
    const { data: existingEntry, error: selectError } = await supabase
      .from('rate_limit_attempts')
      .select('*')
      .eq('identifier', identifier)
      .single()
    
    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking rate limit:', selectError)
      // Em caso de erro, permitir (fail-open para não bloquear usuários legítimos)
      return { allowed: true, remaining: config.MAX_ATTEMPTS }
    }
    
    let entry = existingEntry
    
    // Se não existe entrada, criar uma nova
    if (!entry) {
      const { data: newEntry, error: insertError } = await supabase
        .from('rate_limit_attempts')
        .insert({
          identifier,
          attempts: 0,
          first_attempt: new Date(now).toISOString(),
          last_attempt: new Date(now).toISOString(),
          block_level: 0
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error creating rate limit entry:', insertError)
        return { allowed: true, remaining: config.MAX_ATTEMPTS }
      }
      
      entry = newEntry
    }
    
    // Verificar se ainda está bloqueado
    if (entry.block_until && new Date(entry.block_until).getTime() > now) {
      const waitTime = Math.ceil((new Date(entry.block_until).getTime() - now) / 1000)
      return {
        allowed: false,
        reason: `Muitas tentativas. Tente novamente em ${waitTime} segundos.`,
        waitTime
      }
    }
    
    // Resetar contador se janela expirou
    const firstAttemptTime = new Date(entry.first_attempt).getTime()
    if (firstAttemptTime < windowStart) {
      const { error: resetError } = await supabase
        .from('rate_limit_attempts')
        .update({
          attempts: 0,
          first_attempt: new Date(now).toISOString(),
          last_attempt: new Date(now).toISOString(),
          block_until: null
        })
        .eq('identifier', identifier)
      
      if (resetError) {
        console.error('Error resetting rate limit:', resetError)
      }
      
      return { allowed: true, remaining: config.MAX_ATTEMPTS }
    }
    
    // Verificar se excedeu o limite
    if (entry.attempts >= config.MAX_ATTEMPTS) {
      // Aplicar bloqueio progressivo
      const blockDuration = config.PROGRESSIVE_BLOCKS[
        Math.min(entry.block_level || 0, config.PROGRESSIVE_BLOCKS.length - 1)
      ]
      
      const blockUntil = new Date(now + blockDuration + addJitter()).toISOString()
      
      const { error: blockError } = await supabase
        .from('rate_limit_attempts')
        .update({
          block_until: blockUntil,
          block_level: (entry.block_level || 0) + 1,
          last_attempt: new Date(now).toISOString()
        })
        .eq('identifier', identifier)
      
      if (blockError) {
        console.error('Error applying rate limit block:', blockError)
      }
      
      const waitTime = Math.ceil(blockDuration / 1000)
      return {
        allowed: false,
        reason: `Limite de tentativas excedido. Tente novamente em ${waitTime} segundos.`,
        waitTime
      }
    }
    
    return {
      allowed: true,
      remaining: config.MAX_ATTEMPTS - entry.attempts
    }
  } catch (error) {
    console.error('Unexpected error in rate limiting:', error)
    // Em caso de erro inesperado, permitir (fail-open)
    return { allowed: true, remaining: config.MAX_ATTEMPTS }
  }
}

// Função para registrar tentativa usando tabela persistente
async function recordAttempt(supabase: any, identifier: string, success: boolean): Promise<void> {
  const now = new Date().toISOString()
  
  try {
    if (success) {
      // Sucesso: diminuir contador gradualmente
      const { error } = await supabase.rpc('sql', {
        query: `
          UPDATE rate_limit_attempts 
          SET attempts = GREATEST(0, attempts - 1),
              block_level = GREATEST(0, block_level - 1),
              last_attempt = $1
          WHERE identifier = $2
        `,
        params: [now, identifier]
      })
      
      if (error) {
        console.error('Error recording successful attempt:', error)
      }
    } else {
      // Falha: incrementar contador
      const { error } = await supabase.rpc('sql', {
        query: `
          UPDATE rate_limit_attempts 
          SET attempts = attempts + 1,
              last_attempt = $1
          WHERE identifier = $2
        `,
        params: [now, identifier]
      })
      
      if (error) {
        console.error('Error recording failed attempt:', error)
      }
    }
  } catch (error) {
    console.error('Unexpected error recording attempt:', error)
  }
}

// Função para cleanup do cache usando a função do banco
async function cleanupCache(supabase: any): Promise<void> {
  try {
    const { error } = await supabase.rpc('cleanup_old_rate_limits')
    if (error) {
      console.error('Error during cleanup:', error)
    }
  } catch (error) {
    console.error('Unexpected error during cleanup:', error)
  }
}

// Handler principal da Edge Function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // CORREÇÃO DE SEGURANÇA: Usar variável de ambiente em vez de URL hardcoded
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuração do servidor indisponível',
          code: 'SERVER_CONFIG_ERROR'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Obter dados da requisição
    let requestData: any = {}
    try {
      requestData = await req.json()
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'JSON inválido na requisição',
          code: 'INVALID_JSON'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // CORREÇÃO: Permitir bypass para operações via convite
    const isInviteOperation = requestData.invite_token || requestData.options?.data?.invite_token
    if (isInviteOperation) {
      console.log('🎯 [RATE-LIMITER] Operação via convite detectada - aplicando limites relaxados')
    }
    
    // CORREÇÃO DE SEGURANÇA: Validar entrada
    const validation = validateAuthInput(requestData)
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          error: validation.error,
          code: 'VALIDATION_ERROR'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const { email, password } = requestData
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'
    
    // Criar cliente Supabase para operações de sistema
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Criar identificador seguro
    const identifier = createSecureIdentifier(clientIP, email)
    
    // CORREÇÃO: Aplicar limites relaxados para convites
    const relaxedConfig = isInviteOperation ? {
      ...RATE_LIMIT_CONFIG,
      MAX_ATTEMPTS: 20, // 4x mais tentativas para convites
      WINDOW_MINUTES: 60, // Janela de 1 hora para convites
      PROGRESSIVE_BLOCKS: [15000, 60000, 300000] // Bloqueios mais curtos: 15s, 1min, 5min
    } : RATE_LIMIT_CONFIG
    
    // Verificar rate limiting usando tabela persistente
    const rateLimitCheck = await checkRateLimit(serviceSupabase, identifier, relaxedConfig)
    
    if (!rateLimitCheck.allowed) {
      // Log da tentativa bloqueada
      await serviceSupabase.from('audit_logs').insert({
        user_id: null,
        event_type: 'security_violation',
        action: 'login_rate_limited',
        resource_id: identifier.substring(0, 10) + '***',
        details: {
          email: email.substring(0, 3) + '***',
          ip_hash: identifier,
          reason: rateLimitCheck.reason,
          wait_time: rateLimitCheck.waitTime,
          timestamp: new Date().toISOString()
        },
        severity: 'medium'
      })
      
      return new Response(
        JSON.stringify({ 
          error: rateLimitCheck.reason,
          code: 'RATE_LIMITED',
          waitTime: rateLimitCheck.waitTime
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Tentar login no Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // Registrar resultado da tentativa
    const loginSuccess = !error && data.user
    await recordAttempt(serviceSupabase, identifier, loginSuccess)
    
    // Log da tentativa de autenticação
    await serviceSupabase.from('audit_logs').insert({
      user_id: loginSuccess ? data.user?.id : null,
      event_type: loginSuccess ? 'auth_success' : 'auth_failure',
      action: 'login_attempt',
      resource_id: identifier.substring(0, 10) + '***',
      details: {
        email: email.substring(0, 3) + '***',
        ip_hash: identifier,
        success: loginSuccess,
        error_message: error?.message,
        remaining_attempts: rateLimitCheck.remaining,
        timestamp: new Date().toISOString()
      },
      severity: loginSuccess ? 'info' : 'low'
    })
    
    // Cleanup periódico do cache (1% chance)
    if (Math.random() < 0.01) {
      await cleanupCache(serviceSupabase)
    }
    
    if (error) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          code: 'AUTH_FAILED'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        session: data.session,
        user: data.user
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Error in auth-rate-limiter:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
