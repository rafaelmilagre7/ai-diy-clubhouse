
import { Tool as IconComponent } from "lucide-react";
import * as Icons from "lucide-react";

export interface ToolItem {
  id: string;
  name: string;
  url: string;
  description: string;
  icon?: keyof typeof Icons;
}

export const availableTools: ToolItem[] = [
  {
    id: "openai-api",
    name: "API da OpenAI",
    url: "https://platform.openai.com/assistants",
    description: "Plataforma para desenvolvedores integrarem modelos de IA como GPT-4 em aplicações",
    icon: "Api"
  },
  {
    id: "chatgpt",
    name: "Chat GPT",
    url: "https://chatgpt.com/",
    description: "Interface conversacional da OpenAI para interação direta com modelos GPT",
    icon: "MessageSquare"
  },
  {
    id: "claude",
    name: "Claude",
    url: "https://claude.ai/",
    description: "Assistente de IA da Anthropic com foco em diálogos seguros e úteis",
    icon: "MessageSquare"
  },
  {
    id: "anthropic-api",
    name: "API da Anthropic",
    url: "https://console.anthropic.com/dashboard",
    description: "Plataforma para desenvolvedores integrarem os modelos Claude em aplicações",
    icon: "Api"
  },
  {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com/",
    description: "Modelo de IA multimodal do Google com capacidade de processar texto e imagens",
    icon: "Bot"
  },
  {
    id: "midjourney",
    name: "Midjourney",
    url: "https://www.midjourney.com/",
    description: "Ferramenta de geração de imagens através de descrições textuais",
    icon: "Image"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    url: "https://www.perplexity.ai/",
    description: "Mecanismo de busca avançado potencializado por IA com respostas detalhadas",
    icon: "Search"
  },
  {
    id: "manychat",
    name: "ManyChat",
    url: "https://manychat.com/",
    description: "Plataforma para criar chatbots no WhatsApp, Instagram e Facebook sem código",
    icon: "MessageSquare"
  },
  {
    id: "make",
    name: "Make",
    url: "https://www.make.com/",
    description: "Plataforma de automação para criar fluxos de trabalho integrando diferentes aplicativos",
    icon: "Component"
  },
  {
    id: "typebot",
    name: "Typebot",
    url: "https://typebot.io/",
    description: "Ferramenta para criação de chatbots personalizáveis com fluxos visuais",
    icon: "Type"
  },
  {
    id: "n8n",
    name: "N8N",
    url: "https://n8n.io/",
    description: "Plataforma open-source para automação de fluxos de trabalho entre aplicações",
    icon: "Network"
  },
  {
    id: "creatomate",
    name: "Creatomate",
    url: "https://creatomate.com/",
    description: "Ferramenta para criação automatizada de vídeos personalizados em escala",
    icon: "Video"
  },
  {
    id: "elevenlabs",
    name: "Eleven Labs",
    url: "https://elevenlabs.io/",
    description: "Plataforma de síntese de voz realista com clonagem e emoções naturais",
    icon: "Speaker"
  },
  {
    id: "whatsapp-business",
    name: "WhatsApp Business API",
    url: "https://business.whatsapp.com/",
    description: "Interface para empresas automatizarem comunicação no WhatsApp",
    icon: "Phone"
  },
  {
    id: "twilio",
    name: "Twilio",
    url: "https://www.twilio.com/",
    description: "Plataforma de comunicação para integrar voz, SMS e vídeo em aplicações",
    icon: "Phone"
  },
  {
    id: "screenshotone",
    name: "ScreenShotOne",
    url: "https://screenshotone.com/",
    description: "Serviço para capturar screenshots automatizados de sites e aplicações",
    icon: "Image"
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    url: "https://docs.google.com/spreadsheets/",
    description: "Planilha online colaborativa para armazenamento e análise de dados",
    icon: "FileSpreadsheet"
  },
  {
    id: "notion",
    name: "Notion",
    url: "https://www.notion.com/",
    description: "Espaço de trabalho all-in-one para notas, tarefas, wikis e bases de conhecimento",
    icon: "Book"
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    url: "https://developers.google.com/analytics",
    description: "Ferramenta de análise de tráfego e comportamento em sites e aplicativos",
    icon: "Activity"
  },
  {
    id: "wordpress",
    name: "WordPress",
    url: "https://wordpress.com/",
    description: "Sistema de gerenciamento de conteúdo para criação de sites e blogs",
    icon: "FileText"
  },
  {
    id: "carrd",
    name: "Carrd",
    url: "https://carrd.co/",
    description: "Construtor de sites one-page simples e responsivos sem conhecimento técnico",
    icon: "LayoutDashboard"
  },
  {
    id: "assemblyai",
    name: "AssemblyAI",
    url: "https://www.assemblyai.com/",
    description: "API de reconhecimento de fala para transcrição de áudio e extração de insights",
    icon: "Mic"
  },
  {
    id: "replicate",
    name: "Replicate",
    url: "https://replicate.com/",
    description: "Plataforma para execução de modelos de IA em nuvem via API",
    icon: "Cloud"
  },
  {
    id: "replit",
    name: "Replit",
    url: "https://replit.com/",
    description: "Ambiente de desenvolvimento online para codificação colaborativa em múltiplas linguagens",
    icon: "Code"
  },
  {
    id: "dalle",
    name: "Dall-e OpenAI",
    url: "https://openai.com/index/dall-e-3/",
    description: "Modelo de geração de imagens realistas a partir de descrições textuais",
    icon: "Image"
  },
  {
    id: "whisper",
    name: "Whisper OpenAI",
    url: "https://openai.com/index/whisper/",
    description: "Modelo de reconhecimento de fala com suporte a múltiplos idiomas",
    icon: "Mic"
  },
  {
    id: "gmail",
    name: "Gmail",
    url: "https://gmail.com/",
    description: "Serviço de email do Google com recursos avançados de produtividade",
    icon: "Mail"
  },
  {
    id: "outlook",
    name: "Hotmail Outlook",
    url: "https://hotmail.com/",
    description: "Plataforma de email da Microsoft com calendário e gerenciamento de tarefas",
    icon: "Mail"
  },
  {
    id: "0codekit",
    name: "0codekit",
    url: "https://0codekit.com/",
    description: "Kit de ferramentas no-code para criação de aplicações sem programação",
    icon: "Blocks"
  },
  {
    id: "pdfco",
    name: "PDFco",
    url: "https://pdf.co/",
    description: "Conjunto de APIs para manipulação e conversão de documentos PDF",
    icon: "FileText"
  },
  {
    id: "youtube",
    name: "Youtube",
    url: "https://www.youtube.com/",
    description: "Plataforma de compartilhamento e streaming de vídeos",
    icon: "Youtube"
  },
  {
    id: "airtable",
    name: "Airtable",
    url: "https://www.airtable.com/",
    description: "Banco de dados relacional com interface visual de planilha e automações",
    icon: "Database"
  },
  {
    id: "deepseek",
    name: "Deepseek",
    url: "https://www.deepseek.com/",
    description: "Modelo de IA para busca e análise semântica avançada de informações",
    icon: "Search"
  },
  {
    id: "grok",
    name: "Grok",
    url: "https://grok.com/",
    description: "Assistente de IA da xAI com acesso à web e abordagem menos convencional",
    icon: "Bot"
  },
  {
    id: "fireflies",
    name: "Fireflies",
    url: "https://fireflies.ai/",
    description: "Ferramenta para gravação, transcrição e análise de reuniões com IA",
    icon: "FileAudio"
  },
  {
    id: "tldv",
    name: "TD;DV",
    url: "https://tldv.io/",
    description: "Plataforma para gravar e extrair insights de chamadas e reuniões virtuais",
    icon: "FileVideo"
  },
  {
    id: "lovable",
    name: "Lovable",
    url: "https://lovable.dev/",
    description: "Plataforma para codificação de aplicações web usando IA conversacional",
    icon: "Code"
  },
  {
    id: "google-docs",
    name: "Google Docs",
    url: "https://docs.google.com/",
    description: "Editor de texto online colaborativo com recursos de edição simultânea",
    icon: "FileText"
  },
  {
    id: "convertio",
    name: "Convertio",
    url: "https://convertio.co/",
    description: "Serviço para conversão entre múltiplos formatos de arquivo",
    icon: "FileSymlink"
  },
  {
    id: "rss-app",
    name: "RSS.APP",
    url: "https://rss.app/",
    description: "Ferramenta para criar e gerenciar feeds RSS personalizados de qualquer fonte",
    icon: "Rss"
  },
  {
    id: "kommo",
    name: "Kommo",
    url: "https://www.kommo.com/",
    description: "CRM para automação de vendas e marketing com integração multicanal",
    icon: "Users"
  },
  {
    id: "google-forms",
    name: "Google Forms",
    url: "https://docs.google.com/forms/",
    description: "Ferramenta para criação de formulários e pesquisas online",
    icon: "FormInput"
  },
  {
    id: "linkedin",
    name: "LinkedIN",
    url: "https://br.linkedin.com/",
    description: "Rede social profissional para networking e oportunidades de carreira",
    icon: "Linkedin"
  },
  {
    id: "google-drive",
    name: "Google Drive",
    url: "https://drive.google.com/drive/",
    description: "Armazenamento em nuvem para arquivos com edição colaborativa",
    icon: "HardDrive"
  },
  {
    id: "apify",
    name: "Apify",
    url: "https://apify.com/",
    description: "Plataforma para extração de dados e automação web em escala",
    icon: "Spider"
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    url: "https://calendar.google.com/",
    description: "Serviço de agenda e calendário online com gerenciamento de eventos",
    icon: "Calendar"
  },
  {
    id: "scrapfly",
    name: "ScrapFly",
    url: "https://scrapfly.io/",
    description: "Serviço de web scraping com proxy rotativo para coleta de dados",
    icon: "Globe"
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    url: "https://www.pipedrive.com/pt",
    description: "CRM focado em gestão de pipeline de vendas e acompanhamento de negócios",
    icon: "PipeLine"
  }
];
