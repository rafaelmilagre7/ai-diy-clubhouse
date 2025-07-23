import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, Zap, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const aiExperienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  implementation_status: z.string().min(1, 'Selecione o status da implementação'),
  implementation_approach: z.string().min(1, 'Selecione como pretende implementar'),
  current_tools: z.array(z.string()).optional(),
});

type AIExperienceFormData = z.infer<typeof aiExperienceSchema>;

interface Step3AIExperienceProps {
  initialData?: Partial<AIExperienceFormData>;
  onDataChange: (data: Partial<AIExperienceFormData>) => void;
  onNext: () => void;
}

export const Step3AIExperience: React.FC<Step3AIExperienceProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  const [selectedTools, setSelectedTools] = useState<string[]>(() => {
    const tools = initialData?.current_tools || [];
    console.log('[STEP3] 🚀 Inicializando selectedTools com:', tools);
    // Se não tem ferramentas iniciais, começar com "Nenhuma ainda"
    return tools.length > 0 ? tools : ['Nenhuma ainda'];
  });
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const staticTools = [
    // Automação e Integrações
    { id: '1', name: '0codekit', category: 'Automação e Integrações', logo_url: 'https://i.ibb.co/rRDMwKQj/0codekit-logo.jpg' },
    { id: '2', name: 'Apify', category: 'Automação e Integrações', logo_url: 'https://i.ibb.co/mFNrtgc9/apify-logo.png' },
    { id: '3', name: 'Flowise', category: 'Automação e Integrações', logo_url: 'https://i.ibb.co/sJqMfwzv/flowise-logo.jpg' },
    { id: '4', name: 'Make', category: 'Automação e Integrações', logo_url: 'https://i.ibb.co/XxNWQqFT/make-logo.webp' },
    { id: '5', name: 'ManyChat', category: 'Automação e Integrações', logo_url: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/tool_logos/dnhe5fnqwn5_1745081897881.webp' },
    { id: '6', name: 'Typebot', category: 'Automação e Integrações', logo_url: 'https://i.ibb.co/4g8vqtNX/typebot-logo.jpg' },
    { id: '7', name: 'Zapier', category: 'Automação e Integrações', logo_url: 'https://i.ibb.co/gMW6FMqh/zapier-logo.jpg' },

    // Captura e Análise de Dados
    { id: '8', name: 'Fireflies', category: 'Captura e Análise de Dados', logo_url: 'https://i.ibb.co/7d1489Hh/fireflies-logo.jpg' },
    { id: '9', name: 'Google Analytics', category: 'Captura e Análise de Dados', logo_url: 'https://i.ibb.co/QF623j71/google-analytics.png' },
    { id: '10', name: 'Loom', category: 'Captura e Análise de Dados', logo_url: 'https://i.ibb.co/Fbbxn5WT/loom-logo.png' },
    { id: '11', name: 'Power BI', category: 'Captura e Análise de Dados', logo_url: 'https://i.ibb.co/PG1w8QrS/powerbi-logo.png' },
    { id: '12', name: 'ScrapFly', category: 'Captura e Análise de Dados', logo_url: 'https://i.ibb.co/CpwZNRjQ/scrapfly-logo.png' },
    { id: '13', name: 'ScreenShotOne', category: 'Captura e Análise de Dados', logo_url: 'https://i.ibb.co/HpYYq3Tj/Screen-Shot-One-logo.jpg' },
    { id: '14', name: 'tl;dv', category: 'Captura e Análise de Dados', logo_url: 'https://i.ibb.co/mFMrjBtq/tldv-logo.png' },

    // Comunicação e Atendimento
    { id: '15', name: 'Discord', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/tTPmdFjc/discord-logo.png' },
    { id: '16', name: 'Google Meet', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/W4wvy1fK/google-meet-logo.jpg' },
    { id: '17', name: 'Microsoft Teams', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/1tNHJ1cd/teams-logo.png' },
    { id: '18', name: 'Nicochat', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/C3JwXpFs/nicochat-logo.jpg' },
    { id: '19', name: 'Slack', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/C59CwWgg/slack-logo.png' },
    { id: '20', name: 'Twilio', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/pvDtK5LH/twillio-logo.png' },
    { id: '21', name: 'WhatsApp Business API', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/XwmgnTh/wpp-business-api-logo.webp' },
    { id: '22', name: 'Zendesk', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/Lh1nH0j4/zendesk-logo.webp' },
    { id: '23', name: 'Zoom', category: 'Comunicação e Atendimento', logo_url: 'https://i.ibb.co/BH31k14d/zoom-logo.webp' },

    // Desenvolvimento e Código
    { id: '24', name: 'GitHub', category: 'Desenvolvimento e Código', logo_url: 'https://i.ibb.co/yBBjMZqz/github-logo.png' },
    { id: '25', name: 'Langchain', category: 'Desenvolvimento e Código', logo_url: 'https://i.ibb.co/5hHc2dpq/langchain-logo.webp' },
    { id: '26', name: 'Lovable', category: 'Desenvolvimento e Código', logo_url: 'https://i.ibb.co/FqkrWmdd/lovable-logo.jpg' },
    { id: '27', name: 'Pinecone', category: 'Desenvolvimento e Código', logo_url: 'https://i.ibb.co/LzVYxS1v/pinecone-logo.png' },
    { id: '28', name: 'Replicate', category: 'Desenvolvimento e Código', logo_url: 'https://i.ibb.co/WNv61PsW/replicate-logo.png' },
    { id: '29', name: 'Replit', category: 'Desenvolvimento e Código', logo_url: 'https://i.ibb.co/LzTSFc58/replit-logo.png' },

    // Geração de Conteúdo Visual
    { id: '30', name: 'Canva', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/hx8NpMNd/canva-logo.jpg' },
    { id: '31', name: 'Creatomate', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/Qj89STyv/creatomate-logo.png' },
    { id: '32', name: 'Dall-e OpenAI', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/G3bgyHdx/dall-e3-logo.jpg' },
    { id: '33', name: 'Figma', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/F4hXv9Dm/figma-logo.png' },
    { id: '34', name: 'HeyGen', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/G420qr3k/heygen-logo.jpg' },
    { id: '35', name: 'LumaLabs AI', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/pBF8ypF2/luma-labs-logo.jpg' },
    { id: '36', name: 'MidJourney', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/ccykCNGd/Midjourney-logo.png' },
    { id: '37', name: 'Runway', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/1t7sBKLk/runway-logo.png' },
    { id: '38', name: 'StableDiffusion', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/B5P86ZjN/stability-logo.png' },
    { id: '39', name: 'Synthesia', category: 'Geração de Conteúdo Visual', logo_url: 'https://i.ibb.co/DH4wWpq6/synthesia-logo.png' },

    // Geração e Processamento de Áudio
    { id: '40', name: 'AssemblyAI', category: 'Geração e Processamento de Áudio', logo_url: 'https://i.ibb.co/qLtqYPKk/Assembly-AI-logo.png' },
    { id: '41', name: 'ElevenLabs', category: 'Geração e Processamento de Áudio', logo_url: 'https://i.ibb.co/bgp2TfSB/elevenlabs-logo.png' },
    { id: '42', name: 'Whisper OpenAI', category: 'Geração e Processamento de Áudio', logo_url: 'https://i.ibb.co/ksmPjFcQ/whisper-logo.png' },

    // Gestão de Documentos e Conteúdo
    { id: '43', name: 'Airtable', category: 'Gestão de Documentos e Conteúdo', logo_url: 'https://i.ibb.co/Zz9GKt86/airtable-logo.png' },
    { id: '44', name: 'Convertio', category: 'Gestão de Documentos e Conteúdo', logo_url: 'https://i.ibb.co/XfRzkjz9/convertiologo.png' },
    { id: '45', name: 'Google Docs', category: 'Gestão de Documentos e Conteúdo', logo_url: 'https://i.ibb.co/hRYfzQrx/google-docs-logo.png' },
    { id: '46', name: 'Google Sheets', category: 'Gestão de Documentos e Conteúdo', logo_url: 'https://i.ibb.co/RG58PMrg/google-sheets-logo.png' },
    { id: '47', name: 'Notion', category: 'Gestão de Documentos e Conteúdo', logo_url: 'https://i.ibb.co/Pv2CX8TB/notion-logo.png' },
    { id: '48', name: 'PDF.co', category: 'Gestão de Documentos e Conteúdo', logo_url: 'https://i.ibb.co/N6Cn4BtK/pdf-co-logo.jpg' },

    // Marketing e CRM
    { id: '49', name: 'Apollo', category: 'Marketing e CRM', logo_url: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/tool_logos/logos/e3ef1e5f-0af7-4f13-8e67-f48bcd245ceb_file_v6UKjVqsDXCo7EFfkF8C.png' },
    { id: '50', name: 'Carrd', category: 'Marketing e CRM', logo_url: 'https://i.ibb.co/pv7nDtVR/carrd-logo.png' },
    { id: '51', name: 'Hubspot', category: 'Marketing e CRM', logo_url: 'https://i.ibb.co/WWbJGDNT/hubspot-logo.jpg' },
    { id: '52', name: 'Kommo', category: 'Marketing e CRM', logo_url: 'https://i.ibb.co/ynfNzZdh/kommo-logo.png' },
    { id: '53', name: 'LinkedIn', category: 'Marketing e CRM', logo_url: 'https://i.ibb.co/Fq5csdN7/linkedin-logo.webp' },
    { id: '54', name: 'Lusha', category: 'Marketing e CRM', logo_url: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/tool_logos/logos/fe3c1400-43be-47fe-a5ea-e1eaed9aae90_lusha.png' },
    { id: '55', name: 'Pipedrive', category: 'Marketing e CRM', logo_url: 'https://i.ibb.co/KxZTx2GL/pipedrive-logo.png' },
    { id: '56', name: 'RD Station', category: 'Marketing e CRM', logo_url: 'https://i.ibb.co/Y4fYHrZz/rd-station-logo.jpg' },
    { id: '57', name: 'WordPress', category: 'Marketing e CRM', logo_url: 'https://i.ibb.co/xKXq0d3B/wordpress-logo.png' },

    // Modelos de IA e Interfaces
    { id: '58', name: 'API da OpenAI', category: 'Modelos de IA e Interfaces', logo_url: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/tool_logos/logos/76a9c9a7-b506-46a4-aee6-4ab065849583.jpeg' },
    { id: '59', name: 'API do Claude (Anthropic)', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/0pCzsKSk/claudesonnet-logo.png' },
    { id: '60', name: 'Bedrock (Amazon)', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/PvpGJXvj/bedrock-logo.png' },
    { id: '61', name: 'Chat GPT', category: 'Modelos de IA e Interfaces', logo_url: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/tool_logos/02cxvc0wftpq_1745097206762.jpg' },
    { id: '62', name: 'Deepseek', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/d4WrRvNM/deepseek-logo.png' },
    { id: '63', name: 'Gemini', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/cWxKPPy/google-gemini-logo.png' },
    { id: '64', name: 'Grok', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/qYbPbfgn/grok-logo.png' },
    { id: '65', name: 'Hugging Face', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/5hFVQ5jQ/huggingface-logo.png' },
    { id: '66', name: 'Llama (Meta)', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/Zz6N7dXV/lhama-meta.png' },
    { id: '67', name: 'Microsoft Copilot', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/wZjKnBpS/copilot.png' },
    { id: '68', name: 'Mistral AI', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/Rkvqghzc/mistral-logo.jpg' },
    { id: '69', name: 'Nemotron (NVIDIA)', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/d4BLxC9B/nvidia-logo.jpg' },
    { id: '70', name: 'Perplexity', category: 'Modelos de IA e Interfaces', logo_url: 'https://i.ibb.co/m36CbYJ/perplexity-logo.png' },

    // Outros
    { id: '71', name: 'N8N', category: 'Outros', logo_url: 'https://i.ibb.co/fdV8fqbg/n8n.webp' },
    { id: '72', name: 'Similarweb', category: 'Outros', logo_url: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/tool_logos/logos/2664281d-bef6-48da-9c48-10af480fe49c_logo.png' },

    // Pesquisa e Síntese de Informações
    { id: '73', name: 'RSS.APP', category: 'Pesquisa e Síntese de Informações', logo_url: 'https://i.ibb.co/C5JPSJDJ/rss-logo.png' },

    // Plataformas de Mídia
    { id: '74', name: 'Youtube', category: 'Plataformas de Mídia', logo_url: 'https://i.ibb.co/DH0ZzmG9/youtube-logo.jpg' },

    // Produtividade e Organização
    { id: '75', name: 'Clickup', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/DDf28ryw/Clickup.png' },
    { id: '76', name: 'Gmail', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/WNYtSkS9/gmail-logo.webp' },
    { id: '77', name: 'Google Calendar', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/Jfw1MFb/google-calendar-logo.png' },
    { id: '78', name: 'Google Drive', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/svGRVyBb/google-drive-logo.jpg' },
    { id: '79', name: 'Google Forms', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/B2VKNf1y/google-forms-logo.png' },
    { id: '80', name: 'Hotmail Outlook', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/TBQ1cNBG/hotmail-logo.png' },
    { id: '81', name: 'Miro', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/fd6yWLyh/miro-logo.jpg' },
    { id: '82', name: 'Trello', category: 'Produtividade e Organização', logo_url: 'https://i.ibb.co/xqwrGByX/trello-logo.png' }
  ];
  
  const isLoading = false;
  const lastDataRef = useRef<string>('');
  const onDataChangeRef = useRef(onDataChange);

  const form = useForm<AIExperienceFormData>({
    resolver: zodResolver(aiExperienceSchema),
    defaultValues: {
      experience_level: initialData?.experience_level || '',
      implementation_status: initialData?.implementation_status || '',
      implementation_approach: initialData?.implementation_approach || '',
      current_tools: initialData?.current_tools || [],
    },
    mode: 'onChange', // VOLTA para onChange para funcionar em tempo real
  });

  // SOLUÇÃO SIMPLES: Notificar mudanças quando necessário
  const notifyDataChange = useCallback((newData: Partial<AIExperienceFormData>) => {
    console.log('[STEP3] Notificando mudança:', newData);
    onDataChange(newData);
  }, [onDataChange]);

  // Notificar mudanças apenas quando selectedTools mudar (sem form.watch)
  useEffect(() => {
    const formData = form.getValues();
    // Remove "Nenhuma ainda" das ferramentas finais se houver outras selecionadas
    const finalTools = selectedTools.includes('Nenhuma ainda') && selectedTools.length > 1 
      ? selectedTools.filter(tool => tool !== 'Nenhuma ainda')
      : selectedTools;
    
    const completeData = { ...formData, current_tools: finalTools };
    
    console.log('[STEP3] 🔄 Notificando mudança - selectedTools:', selectedTools, '| finalTools:', finalTools);
    
    // Sempre notifica para manter o estado atualizado
    notifyDataChange(completeData);
  }, [selectedTools, notifyDataChange]);

  // Notificar mudanças nos campos do form separadamente
  useEffect(() => {
    const subscription = form.watch((data) => {
      const finalTools = selectedTools.includes('Nenhuma ainda') && selectedTools.length > 1 
        ? selectedTools.filter(tool => tool !== 'Nenhuma ainda')
        : selectedTools;
      
      const completeData = { ...data, current_tools: finalTools };
      console.log('[STEP3] 📝 Mudança no form detectada:', completeData);
      notifyDataChange(completeData);
    });

    return () => subscription.unsubscribe();
  }, [form, selectedTools, notifyDataChange]);

  const handleSelectChange = (field: keyof AIExperienceFormData, value: string) => {
    form.setValue(field, value);
    // A notificação acontece automaticamente via useEffect
  };

  const handleToolClick = useCallback((toolName: string) => {
    console.log('[STEP3] 🖱️ CLICK REGISTRADO na ferramenta:', toolName);
    console.log('[STEP3] 📊 Estado atual selectedTools:', selectedTools);
    
    let newSelectedTools: string[];
    
    if (toolName === 'Nenhuma ainda') {
      // Se clicar em "Nenhuma ainda", limpar todas e só deixar essa
      newSelectedTools = ['Nenhuma ainda'];
      console.log('[STEP3] ✅ Selecionando APENAS Nenhuma ainda');
    } else {
      // Se tem "Nenhuma ainda" selecionada, remover ela e adicionar a nova ferramenta
      if (selectedTools.includes('Nenhuma ainda')) {
        newSelectedTools = [toolName];
        console.log('[STEP3] ✅ Removendo Nenhuma ainda e adicionando:', toolName);
      } else {
        // Lógica normal de toggle
        if (selectedTools.includes(toolName)) {
          // Remover ferramenta
          newSelectedTools = selectedTools.filter(tool => tool !== toolName);
          console.log('[STEP3] ✅ Removendo ferramenta:', toolName);
          // Se ficou vazio, adicionar "Nenhuma ainda"
          if (newSelectedTools.length === 0) {
            newSelectedTools = ['Nenhuma ainda'];
            console.log('[STEP3] ✅ Lista vazia, adicionando Nenhuma ainda');
          }
        } else {
          // Adicionar ferramenta
          newSelectedTools = [...selectedTools, toolName];
          console.log('[STEP3] ✅ Adicionando ferramenta:', toolName);
        }
      }
    }
    
    console.log('[STEP3] 🔄 MUDANÇA DE ESTADO:', selectedTools, '→', newSelectedTools);
    setSelectedTools(newSelectedTools);
    
    // Força uma re-render para garantir que a UI atualize
    setTimeout(() => {
      console.log('[STEP3] ✅ Estado confirmado após update:', newSelectedTools);
    }, 50);
  }, [selectedTools]);

  const handleImageError = useCallback((toolId: string) => {
    setFailedImages(prev => new Set([...prev, toolId]));
  }, []);

  const handleSubmit = (data: AIExperienceFormData) => {
    console.log('[Step3] Enviando dados:', data);
    
    if (!data.experience_level || !data.implementation_status || !data.implementation_approach) {
      console.error('[Step3] Campos obrigatórios não preenchidos');
      return;
    }
    
    onNext();
  };

  // Organizar ferramentas por categoria - memoizado para evitar recálculos
  const organizedTools = useMemo(() => {
    const categories = [
      'Modelos de IA e Interfaces',
      'Geração de Conteúdo Visual',
      'Geração e Processamento de Áudio',
      'Automação e Integrações',
      'Comunicação e Atendimento',
      'Captura e Análise de Dados',
      'Pesquisa e Síntese de Informações',
      'Gestão de Documentos e Conteúdo',
      'Marketing e CRM',
      'Produtividade e Organização',
      'Desenvolvimento e Código',
      'Plataformas de Mídia',
      'Outros'
    ];

    return categories.reduce((acc, category) => {
      const toolsInCategory = staticTools
        .filter(tool => tool.category === category)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      if (toolsInCategory.length > 0) {
        acc[category] = toolsInCategory;
      }
      
      return acc;
    }, {} as Record<string, typeof staticTools>);
  }, [staticTools]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Bot className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Vamos entender sua experiência atual com IA para criar o melhor plano de aprendizado
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Qual é seu nível de experiência com IA?
          </Label>
          <Select onValueChange={(value) => handleSelectChange('experience_level', value)} defaultValue={form.getValues('experience_level') || ''}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante - Nunca usei ferramentas de IA</SelectItem>
              <SelectItem value="basic">Básico - Uso algumas ferramentas ocasionalmente</SelectItem>
              <SelectItem value="intermediate">Intermediário - Uso IA regularmente no trabalho</SelectItem>
              <SelectItem value="advanced">Avançado - Implemento soluções de IA na empresa</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.experience_level && (
            <p className="text-sm text-destructive">
              {form.formState.errors.experience_level.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Qual é o status da implementação de IA na sua empresa?
          </Label>
          <Select onValueChange={(value) => handleSelectChange('implementation_status', value)} defaultValue={form.getValues('implementation_status') || ''}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o status atual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Ainda não começamos</SelectItem>
              <SelectItem value="exploring">Estamos explorando possibilidades</SelectItem>
              <SelectItem value="testing">Testando algumas ferramentas</SelectItem>
              <SelectItem value="implementing">Implementando soluções</SelectItem>
              <SelectItem value="advanced">Já temos IA integrada aos processos</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.implementation_status && (
            <p className="text-sm text-destructive">
              {form.formState.errors.implementation_status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Como pretende implementar IA na sua empresa?
          </Label>
          <Select onValueChange={(value) => handleSelectChange('implementation_approach', value)} defaultValue={form.getValues('implementation_approach') || ''}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione sua abordagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">Eu mesmo vou fazer</SelectItem>
              <SelectItem value="team">Meu time</SelectItem>
              <SelectItem value="hire">Quero contratar</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.implementation_approach && (
            <p className="text-sm text-destructive">
              {form.formState.errors.implementation_approach.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Quais ferramentas de IA você já usa? (selecione todas que se aplicam)
          </Label>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando ferramentas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(organizedTools).map(([category, categoryTools]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryTools.map((tool) => (
                      <Card 
                        key={tool.id} 
                        className={`cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md ${
                          selectedTools.includes(tool.name) 
                            ? 'border-2 border-primary bg-primary/10 shadow-lg' 
                            : 'border border-border hover:bg-accent/50'
                        }`}
                        onClick={() => {
                          console.log('[STEP3] 🎯 Card onClick DISPARADO - ferramenta:', tool.name);
                          handleToolClick(tool.name);
                        }}
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
                              {failedImages.has(tool.id) ? (
                                <div className="text-xs font-medium text-primary flex items-center justify-center w-full h-full">
                                  {tool.name.charAt(0)}
                                </div>
                              ) : (
                                <img 
                                  src={tool.logo_url} 
                                  alt={`${tool.name} logo`}
                                  className="w-6 h-6 object-contain"
                                  onError={() => handleImageError(tool.id)}
                                />
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-medium flex-1 text-left ml-2">
                            {tool.name}
                          </span>
                          <Checkbox
                            checked={selectedTools.includes(tool.name)}
                            onChange={() => {}} // Checkbox apenas visual
                            className="pointer-events-none"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Opção "Nenhuma ainda" no final */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Opções especiais</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md ${
                      selectedTools.includes('Nenhuma ainda') 
                        ? 'border-2 border-primary bg-primary/10 shadow-lg' 
                        : 'border border-border hover:bg-accent/50'
                    }`}
                    onClick={() => {
                      console.log('[STEP3] 🎯 Card onClick DISPARADO - Nenhuma ainda');
                      handleToolClick('Nenhuma ainda');
                    }}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                          <span className="text-xs">❌</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium flex-1 text-left ml-2">
                        Nenhuma ainda
                      </span>
                      <Checkbox
                        checked={selectedTools.includes('Nenhuma ainda')}
                        onChange={() => {}} // Checkbox apenas visual
                        className="pointer-events-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90"
            disabled={!form.formState.isValid || !form.getValues('experience_level') || !form.getValues('implementation_status') || !form.getValues('implementation_approach')}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};