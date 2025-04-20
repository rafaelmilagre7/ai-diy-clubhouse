
import { ToolItem } from "../types/toolItemTypes";

export const aiTools: ToolItem[] = [
  {
    id: "openai-api",
    name: "API da OpenAI",
    url: "https://platform.openai.com/assistants",
    description: "Plataforma para desenvolvedores integrarem modelos de IA como GPT-4 em aplicações",
    icon: "CircuitBoard"
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
    icon: "CircuitBoard"
  },
  {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com/",
    description: "Modelo de IA multimodal do Google com capacidade de processar texto e imagens",
    icon: "Bot"
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
  }
];
