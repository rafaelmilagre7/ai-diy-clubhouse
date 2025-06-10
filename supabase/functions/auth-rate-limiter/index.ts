
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

// Configuração do rate limiting
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,
  WINDOW_MINUTES: 10,
  PROGRESSIVE_BLOCKS: [60000, 300000, 900000], // 1min, 5min, 15min em ms
  JITTER_MAX: 500, // máximo 500ms de jitter
  CLEANUP_INTERVAL: 86400000 // 24h em ms
}

// Cache em memória para rate limiting (thread-safe para Edge Functions)
const rateLimitCache = new Map<string, {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockUntil?: number;
  blockLevel: number;
}>()

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

// Função para verificar e aplicar rate limiting
function checkRateLimit(identifier: string): {
  allowed: boolean;
  reason?: string;
  waitTime?: number;
  remaining?: number;
} {
  const now = Date.now()
  const windowStart = now - (RATE_LIMIT_CONFIG.WINDOW_MINUTES * 60 * 1000)
  
  // Obter ou criar entrada no cache
  let entry = rateLimitCache.get(identifier)
  
  if (!entry) {
    entry = {
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now,
      blockLevel: 0
    }
    rateLimitCache.set(identifier, entry)
  }
  
  // Verificar se ainda está bloqueado
  if (entry.blockUntil && now < entry.blockUntil) {
    const waitTime = Math.ceil((entry.blockUntil - now) / 1000)
    return {
      allowed: false,
      reason: `Muitas tentativas. Tente novamente em ${waitTime} segundos.`,
      waitTime
    }
  }
  
  // Limpar bloqueio expirado
  if (entry.blockUntil && now >= entry.blockUntil) {
    entry.blockUntil = undefined
  }
  
  // Resetar contador se janela expirou
  if (entry.firstAttempt < windowStart) {
    entry.attempts = 0
    entry.firstAttempt = now
  }
  
  // Verificar se excedeu o limite
  if (entry.attempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
    // Aplicar bloqueio progressivo
    const blockDuration = RATE_LIMIT_CONFIG.PROGRESSIVE_BLOCKS[
      Math.min(entry.blockLevel, RATE_LIMIT_CONFIG.PROGRESSIVE_BLOCKS.length - 1)
    ]
    
    entry.blockUntil = now + blockDuration + addJitter()
    entry.blockLevel++
    
    const waitTime = Math.ceil(blockDuration / 1000)
    return {
      allowed: false,
      reason: `Limite de tentativas excedido. Tente novamente em ${waitTime} segundos.`,
      waitTime
    }
  }
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS - entry.attempts
  }
}

// Função para registrar tentativa
function recordAttempt(identifier: string, success: boolean) {
  const now = Date.now()
  let entry = rateLimitCache.get(identifier)
  
  if (!entry) {
    entry = {
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now,
      blockLevel: 0
    }
  }
  
  if (success) {
    // Sucesso: resetar contador gradualmente
    entry.attempts = Math.max(0, entry.attempts - 1)
    entry.blockLevel = Math.max(0, entry.blockLevel - 1)
  } else {
    // Falha: incrementar contador
    entry.attempts++
    entry.lastAttempt = now
  }
  
  rateLimitCache.set(identifier, entry)
}

// Função para cleanup do cache
function cleanupCache() {
  const now = Date.now()
  const expireTime = now - RATE_LIMIT_CONFIG.CLEANUP_INTERVAL
  
  for (const [key, entry] of rateLimitCache.entries()) {
    if (entry.lastAttempt < expireTime && (!entry.blockUntil || entry.blockUntil < now)) {
      rateLimitCache.delete(key)
    }
  }
}

// Handler principal da Edge Function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Obter dados da requisição
    const { email, password } = await req.json()
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'
    
    // Validações básicas
    if (!email || !password) {
      return new Response(
        JSON.stringify({ 
          error: 'Email e senha são obrigatórios',
          code: 'MISSING_CREDENTIALS'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Criar identificador seguro
    const identifier = createSecureIdentifier(clientIP, email)
    
    // Verificar rate limiting
    const rateLimitCheck = checkRateLimit(identifier)
    
    if (!rateLimitCheck.allowed) {
      // Log da tentativa bloqueada
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase.from('audit_logs').insert({
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // Registrar resultado da tentativa
    const loginSuccess = !error && data.user
    recordAttempt(identifier, loginSuccess)
    
    // Log da tentativa de autenticação
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
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
    
    // Cleanup periódico do cache
    if (Math.random() < 0.01) { // 1% chance
      cleanupCache()
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
