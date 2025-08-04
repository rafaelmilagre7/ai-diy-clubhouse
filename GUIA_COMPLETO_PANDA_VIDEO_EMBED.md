# 🎬 Guia Completo: Implementação do Panda Video Embed

> **Base:** Implementação de sucesso do Viver de IA Club

## 📋 **Sumário**
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Backend](#configuração-do-backend)
3. [Componentes Frontend](#componentes-frontend)
4. [Edge Functions](#edge-functions)
5. [Integração com Banco](#integração-com-banco)
6. [Exemplo de Uso](#exemplo-de-uso)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 **1. Pré-requisitos**

### **Credenciais Necessárias:**
- **PANDA_API_KEY**: Chave da API do Panda Video
- **Domínio configurado** no painel do Panda Video

### **Tecnologias:**
- React/TypeScript
- Supabase (ou backend similar)
- Tailwind CSS (opcional, para styles)

---

## ⚙️ **2. Configuração do Backend**

### **2.1 Variáveis de Ambiente**
```bash
# Supabase Edge Functions ou similar
PANDA_API_KEY=sua_chave_aqui
```

### **2.2 Schema do Banco (exemplo para Supabase)**
```sql
-- Tabela para armazenar vídeos
CREATE TABLE learning_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_type TEXT NOT NULL DEFAULT 'panda', -- 'panda', 'youtube', etc.
  video_id TEXT NOT NULL, -- ID do vídeo no Panda
  url TEXT NOT NULL, -- URL completa do player
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - ajustar conforme sua lógica
ALTER TABLE learning_videos ENABLE ROW LEVEL SECURITY;
```

---

## 🎯 **3. Componentes Frontend**

### **3.1 Player Principal - PandaVideoPlayer.tsx**
```typescript
import React, { useEffect, useRef } from 'react';

interface PandaVideoPlayerProps {
  videoId: string;
  url?: string;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export const PandaVideoPlayer: React.FC<PandaVideoPlayerProps> = ({
  videoId,
  url,
  title = "Vídeo",
  width = "100%",
  height = "100%",
  className,
  onProgress,
  onEnded
}) => {
  const [loading, setLoading] = React.useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 🔑 IMPORTANTE: Use seu subdomínio específico do Panda
  const playerUrl = url || `https://player-vz-SEU-SUBDOMAIN.tv.pandavideo.com.br/embed/?v=${videoId}`;

  // 📡 Listener para comunicação com iframe do Panda
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        // ✅ SECURITY: Verificar origem
        if (!event.origin.includes('pandavideo.com.br')) return;
        
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // 📊 Tracking de progresso
        if (data.event === 'progress' && onProgress && typeof data.percent === 'number') {
          // Converter para binário: >= 95% = concluído
          const binaryProgress = data.percent >= 95 ? 100 : 0;
          onProgress(binaryProgress);
          console.log(`Progresso: ${data.percent}% (binário: ${binaryProgress}%)`);
        }
        
        // 🏁 Fim do vídeo
        if (data.event === 'ended' && onEnded) {
          onEnded();
          console.log('Vídeo finalizado');
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, onEnded]);

  return (
    <div className={`relative w-full aspect-video ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-md z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <div className="text-white text-sm">Carregando vídeo...</div>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={playerUrl}
        title={title}
        width={width}
        height={height}
        loading="eager"
        className="w-full h-full rounded-md"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        style={{ 
          backgroundColor: '#0f172a',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};
```

### **3.2 Componente de Embed - PandaVideoEmbed.tsx**
```typescript
import React, { useState } from 'react';

interface PandaVideoEmbedProps {
  value?: string;
  onChange: (embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
  label?: string;
  description?: string;
}

// 🔍 Função para extrair info do iframe
export const extractPandaVideoInfo = (embedCode: string): { videoId: string; url: string; thumbnailUrl: string } | null => {
  if (typeof embedCode !== 'string') return null;
  
  try {
    // Extrair src do iframe
    const srcMatch = embedCode.match(/src=["'](https:\/\/[^"']+)["']/i);
    if (!srcMatch || !srcMatch[1]) return null;
    
    const iframeSrc = srcMatch[1];
    let videoId = '';
    
    // 🎯 Padrões de URL do Panda Video:
    // Formato 1: https://player-vz-SUBDOMAIN.tv.pandavideo.com.br/embed/?v=VIDEO_ID
    const videoIdMatch = iframeSrc.match(/embed\/\?v=([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      videoId = videoIdMatch[1];
    } else {
      // Formato 2: https://player.pandavideo.com.br/embed/VIDEO_ID
      const altMatch = iframeSrc.match(/\/embed\/([^/?]+)/);
      if (altMatch && altMatch[1]) {
        videoId = altMatch[1];
      }
    }
    
    // 📸 URL da thumbnail
    const thumbnailUrl = videoId ? `https://thumbs.pandavideo.com.br/${videoId}.jpg` : '';
    
    return { videoId, url: iframeSrc, thumbnailUrl };
  } catch (error) {
    console.error('Erro ao extrair info do Panda Video:', error);
    return null;
  }
};

export const PandaVideoEmbed: React.FC<PandaVideoEmbedProps> = ({
  value = '',
  onChange,
  label = 'Código de Incorporação do Panda Video',
  description = 'Cole o código iframe completo fornecido pelo Panda Video'
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (embedCode: string) => {
    if (!embedCode.trim()) {
      setError(null);
      return;
    }
    
    const videoInfo = extractPandaVideoInfo(embedCode);
    
    if (!videoInfo || !videoInfo.videoId) {
      setError('Código de incorporação inválido. Certifique-se de que é um iframe do Panda Video.');
      return;
    }
    
    setError(null);
    onChange(embedCode, videoInfo.videoId, videoInfo.url, videoInfo.thumbnailUrl);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Cole aqui o código iframe do Panda Video"
        className="w-full h-32 p-3 border rounded-md resize-none"
        rows={4}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

---

## 🚀 **4. Edge Functions**

### **4.1 Listar Vídeos - list-panda-videos/index.ts**
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPandaVideos(limit = 20, page = 1) {
  const pandaApiKey = Deno.env.get('PANDA_API_KEY');
  
  if (!pandaApiKey) {
    throw new Error('PANDA_API_KEY não definida');
  }
  
  const url = `https://api-v2.pandavideo.com.br/videos?limit=${limit}&page=${page}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': pandaApiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }
  
  const data = await response.json();
  
  // 🔄 Transformar para formato padronizado
  const videos = data.videos?.map((video: any) => ({
    id: video.id,
    title: video.title || 'Sem título',
    description: video.description || '',
    url: `https://player.pandavideo.com.br/embed/${video.id}`,
    thumbnail_url: video.thumbnail?.url || null,
    duration_seconds: video.duration || 0,
    created_at: video.created_at,
  })) || [];
  
  return {
    videos,
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    pages: data.pagination?.pages || 1,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const { limit = 20, page = 1 } = await req.json();
    const result = await fetchPandaVideos(limit, page);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

### **4.2 Upload de Vídeo - upload-panda-video/index.ts**
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const PANDA_UPLOAD_URL = "https://uploader-us01.pandavideo.com.br/files";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const apiKey = Deno.env.get("PANDA_API_KEY");
    if (!apiKey) {
      throw new Error("API Key do Panda Video não configurada");
    }
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    
    if (!file) {
      throw new Error("Arquivo não fornecido");
    }
    
    // 📤 Upload usando protocolo TUS (recomendado pelo Panda)
    const uploadResponse = await fetch(PANDA_UPLOAD_URL, {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": file.size.toString(),
        "Upload-Metadata": `filename ${btoa(file.name)},title ${btoa(title || file.name)}`,
      },
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Erro no upload: ${uploadResponse.status}`);
    }
    
    const uploadUrl = uploadResponse.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("URL de upload não recebida");
    }
    
    // 📤 Enviar arquivo
    const buffer = await file.arrayBuffer();
    const patchResponse = await fetch(uploadUrl, {
      method: "PATCH",
      headers: {
        "Authorization": apiKey,
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "0",
        "Content-Type": "application/offset+octet-stream",
      },
      body: buffer,
    });
    
    if (!patchResponse.ok) {
      throw new Error(`Erro no envio: ${patchResponse.status}`);
    }
    
    // 🎯 Extrair ID do vídeo da resposta
    const videoId = uploadUrl.split('/').pop();
    
    return new Response(JSON.stringify({
      success: true,
      videoId,
      url: `https://player.pandavideo.com.br/embed/${videoId}`,
      message: "Upload realizado com sucesso"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message || 'Erro no upload'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

---

## 💾 **5. Integração com Banco**

### **5.1 Hook para Gerenciar Vídeos**
```typescript
import { useState, useEffect } from 'react';
import { supabase } from './supabase'; // Ajuste conforme sua config

export const usePandaVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 📋 Buscar vídeos do banco
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_videos')
        .select('*')
        .eq('video_type', 'panda')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // ➕ Adicionar vídeo
  const addVideo = async (videoData: any) => {
    try {
      const { data, error } = await supabase
        .from('learning_videos')
        .insert([{
          ...videoData,
          video_type: 'panda'
        }])
        .select()
        .single();
      
      if (error) throw error;
      setVideos(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      return { success: false, error };
    }
  };
  
  // 🗑️ Remover vídeo
  const removeVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('learning_videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
      setVideos(prev => prev.filter(v => v.id !== videoId));
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      return { success: false, error };
    }
  };
  
  useEffect(() => {
    fetchVideos();
  }, []);
  
  return {
    videos,
    loading,
    addVideo,
    removeVideo,
    refreshVideos: fetchVideos
  };
};
```

---

## 🎯 **6. Exemplo de Uso Completo**

### **6.1 Componente de Admin/Gerenciamento**
```typescript
import React, { useState } from 'react';
import { PandaVideoEmbed } from './PandaVideoEmbed';
import { PandaVideoPlayer } from './PandaVideoPlayer';
import { usePandaVideos } from './usePandaVideos';

export const VideoManager = () => {
  const [embedCode, setEmbedCode] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const { videos, addVideo, loading } = usePandaVideos();
  
  const handleEmbedChange = (code, videoId, url, thumbnailUrl) => {
    setEmbedCode(code);
    setVideoInfo({ videoId, url, thumbnailUrl });
  };
  
  const handleAddVideo = async () => {
    if (!videoInfo) return;
    
    const result = await addVideo({
      title: `Vídeo ${videoInfo.videoId}`,
      video_id: videoInfo.videoId,
      url: videoInfo.url,
      thumbnail_url: videoInfo.thumbnailUrl,
    });
    
    if (result.success) {
      setEmbedCode('');
      setVideoInfo(null);
      alert('Vídeo adicionado com sucesso!');
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciar Vídeos Panda</h2>
      
      {/* Formulário de Embed */}
      <div className="border p-4 rounded-lg">
        <PandaVideoEmbed
          value={embedCode}
          onChange={handleEmbedChange}
        />
        
        {videoInfo && (
          <div className="mt-4 space-y-4">
            <div>
              <strong>Preview:</strong>
              <PandaVideoPlayer
                videoId={videoInfo.videoId}
                url={videoInfo.url}
                className="mt-2 max-w-md"
              />
            </div>
            
            <button
              onClick={handleAddVideo}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Adicionar Vídeo
            </button>
          </div>
        )}
      </div>
      
      {/* Lista de Vídeos */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Vídeos Salvos</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {videos.map(video => (
              <div key={video.id} className="border p-4 rounded">
                <h4 className="font-medium">{video.title}</h4>
                <PandaVideoPlayer
                  videoId={video.video_id}
                  url={video.url}
                  className="mt-2 max-w-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🔧 **7. Troubleshooting**

### **❌ Problema: Vídeo não carrega**
**Possíveis causas:**
- Subdomain incorreto na URL do player
- API Key inválida ou expirada
- Domínio não configurado no painel do Panda

**✅ Solução:**
1. Verificar subdomain no painel do Panda Video
2. Testar API Key em requisição manual
3. Adicionar domínio nas configurações do Panda

### **❌ Problema: Eventos de progresso não funcionam**
**✅ Solução:**
```typescript
// Certifique-se de verificar a origem das mensagens
if (!event.origin.includes('pandavideo.com.br')) return;

// Debug das mensagens recebidas
console.log('Mensagem recebida:', event);
```

### **❌ Problema: CORS errors**
**✅ Solução:**
- Configure CORS headers em todas as Edge Functions
- Adicione domínio no painel do Panda Video
- Use OPTIONS handler correto

---

## 🎯 **8. Checklist Final**

### **✅ Backend:**
- [ ] PANDA_API_KEY configurada
- [ ] Edge Functions deployadas  
- [ ] Banco com schema correto
- [ ] RLS policies configuradas

### **✅ Frontend:**
- [ ] PandaVideoPlayer implementado
- [ ] PandaVideoEmbed implementado
- [ ] Função extractPandaVideoInfo implementada
- [ ] Hook usePandaVideos implementado

### **✅ Configurações:**
- [ ] Subdomain correto nas URLs
- [ ] Domínio autorizado no painel Panda
- [ ] CORS headers configurados
- [ ] Event listeners funcionando

---

## 📞 **Suporte**

Se encontrar problemas:

1. **Verifique logs** das Edge Functions
2. **Teste API Key** com curl:
   ```bash
   curl -H "Authorization: SUA_API_KEY" \
        https://api-v2.pandavideo.com.br/videos?limit=1
   ```
3. **Debug mensagens** do iframe no console
4. **Confirme subdomain** no painel do Panda Video

---

**🎯 Com este guia, você terá a mesma implementação robusta que funciona no Viver de IA Club!**