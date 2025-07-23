export interface AITool {
  id: string;
  name: string;
  category: string;
  logo_url: string;
  description?: string;
}

export const AI_TOOL_CATEGORIES = [
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
] as const;

export const AI_TOOLS: AITool[] = [
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

export const SPECIAL_OPTIONS = [
  { id: 'none', name: 'Nenhuma ainda', icon: '❌' }
] as const;

// Função para organizar ferramentas por categoria
export const getToolsByCategory = () => {
  return AI_TOOL_CATEGORIES.reduce((acc, category) => {
    const toolsInCategory = AI_TOOLS
      .filter(tool => tool.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    if (toolsInCategory.length > 0) {
      acc[category] = toolsInCategory;
    }
    
    return acc;
  }, {} as Record<string, AITool[]>);
};