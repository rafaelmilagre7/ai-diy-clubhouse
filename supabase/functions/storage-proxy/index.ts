
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-proxy-type, x-bucket-name',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ProxyRequest {
  bucket: string;
  path: string;
  type: 'image' | 'document' | 'storage' | 'certificate';
}

interface AnalyticsData {
  type: string;
  bucket: string;
  path: string;
  userAgent?: string;
  referer?: string;
  ip?: string;
  timestamp: string;
}

serve(async (req: Request) => {
  console.log(`[Storage Proxy] ${req.method} request received`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse URL to extract bucket and path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected format: /storage-proxy/{type}/{bucket}/{...path}
    if (pathParts.length < 3) {
      console.error('[Storage Proxy] Invalid path format:', url.pathname);
      return new Response('Invalid path format', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const type = pathParts[1] as 'image' | 'document' | 'storage' | 'certificate';
    const bucket = pathParts[2];
    const filePath = pathParts.slice(3).join('/');

    console.log(`[Storage Proxy] Processing ${type} request:`, {
      bucket,
      path: filePath,
      queryParams: url.search
    });

    // Validate type
    if (!['image', 'document', 'storage', 'certificate'].includes(type)) {
      console.error('[Storage Proxy] Invalid type:', type);
      return new Response('Invalid proxy type', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Build Supabase storage URL
    const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
    const storageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}${url.search}`;
    
    console.log(`[Storage Proxy] Fetching from Supabase:`, storageUrl);

    // Fetch from Supabase Storage
    const response = await fetch(storageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'VIVER-DE-IA-Proxy/1.0'
      }
    });

    if (!response.ok) {
      console.error(`[Storage Proxy] Supabase storage error:`, {
        status: response.status,
        statusText: response.statusText,
        url: storageUrl
      });
      
      return new Response(`Storage error: ${response.statusText}`, {
        status: response.status,
        headers: corsHeaders
      });
    }

    // Get content type and size
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    
    console.log(`[Storage Proxy] Successfully fetched:`, {
      contentType,
      contentLength: contentLength ? `${contentLength} bytes` : 'unknown',
      cacheControl: response.headers.get('cache-control')
    });

    // Collect analytics data
    const analyticsData: AnalyticsData = {
      type,
      bucket,
      path: filePath,
      userAgent: req.headers.get('user-agent') || undefined,
      referer: req.headers.get('referer') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      timestamp: new Date().toISOString()
    };

    // Log analytics (non-blocking)
    logAnalytics(analyticsData).catch(error => {
      console.warn('[Storage Proxy] Analytics logging failed:', error);
    });

    // Set optimized cache headers based on type
    const cacheHeaders = getCacheHeaders(type);
    
    // Create response headers
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Cache-Control', cacheHeaders.cacheControl);
    responseHeaders.set('CDN-Cache-Control', cacheHeaders.cdnCacheControl);
    responseHeaders.set('Vary', 'Accept-Encoding');
    responseHeaders.set('X-Proxy-Type', type);
    responseHeaders.set('X-Proxy-Source', 'viverdeia-proxy');
    
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    // Add security headers
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    console.log(`[Storage Proxy] Response sent with headers:`, {
      cacheControl: cacheHeaders.cacheControl,
      contentType,
      proxyType: type
    });

    return new Response(response.body, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('[Storage Proxy] Unexpected error:', error);
    
    return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown proxy error'}`, {
      status: 500,
      headers: corsHeaders
    });
  }
});

/**
 * Get cache headers based on content type
 */
function getCacheHeaders(type: string) {
  const configs: Record<string, { cacheControl: string; cdnCacheControl: string }> = {
    certificate: {
      cacheControl: 'public, max-age=86400, stale-while-revalidate=172800', // 1 dia + 2 dias SWR
      cdnCacheControl: 'public, max-age=31536000' // 1 ano para CDN
    },
    image: {
      cacheControl: 'public, max-age=64800, stale-while-revalidate=129600', // 18h + 36h SWR
      cdnCacheControl: 'public, max-age=31536000' // 1 ano para CDN
    },
    document: {
      cacheControl: 'public, max-age=54000, stale-while-revalidate=108000', // 15h + 30h SWR
      cdnCacheControl: 'public, max-age=31536000' // 1 ano para CDN
    },
    storage: {
      cacheControl: 'public, max-age=43200, stale-while-revalidate=86400', // 12h + 24h SWR
      cdnCacheControl: 'public, max-age=31536000' // 1 ano para CDN
    }
  };

  return configs[type] || configs.storage;
}

/**
 * Log analytics data (non-blocking)
 */
async function logAnalytics(data: AnalyticsData): Promise<void> {
  try {
    // Em uma implementação real, você poderia salvar isso em uma tabela de analytics
    // ou enviar para um serviço de analytics externo
    console.log('[Storage Proxy] Analytics:', {
      type: data.type,
      bucket: data.bucket,
      path: data.path.substring(0, 50) + (data.path.length > 50 ? '...' : ''),
      timestamp: data.timestamp,
      hasUserAgent: !!data.userAgent,
      hasReferer: !!data.referer
    });
    
    // TODO: Implementar salvamento real dos dados de analytics
    // Exemplos:
    // - Salvar em tabela do Supabase
    // - Enviar para Google Analytics
    // - Enviar para Mixpanel/Amplitude
    // - Salvar em logs estruturados
    
  } catch (error) {
    console.warn('[Storage Proxy] Failed to log analytics:', error);
  }
}
