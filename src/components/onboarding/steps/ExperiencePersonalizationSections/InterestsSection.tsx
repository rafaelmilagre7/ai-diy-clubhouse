
import React from "react";
import { cn } from "@/lib/utils";

const INTERESTS_OPTIONS = [
  { label: "Engenharia de Prompts", value: "engenharia_prompts", icon: "code" },
  { label: "Geração de Conteúdo com IA", value: "geracao_conteudo", icon: "file-text" },
  { label: "Automação e Produtividade", value: "automacao_produtividade", icon: "zap" },
  { label: "Marketing com IA", value: "marketing_ia", icon: "star" },
  { label: "Atendimento ao Cliente com IA", value: "atendimento_cliente", icon: "handshake" },
  { label: "Estratégia de Negócios com IA", value: "estrategia_negocios", icon: "layout-dashboard" },
  { label: "Chatbots e Assistentes Virtuais", value: "chatbots_assistentes", icon: "message-square" },
  { label: "Pesquisa com IA", value: "pesquisa_ia", icon: "database" },
  { label: "Geração de Código com IA", value: "geracao_codigo", icon: "code" },
  { label: "Vendas com IA", value: "vendas_ia", icon: "users" },
  { label: "Análise de Dados com IA", value: "analise_dados", icon: "chart-bar" },
];

export function InterestsSection({ watch, toggleSelect, errors }: any) {
  return (
    <div>
      <label className="font-semibold text-gray-700 mb-2 block">
        Interesses Específicos em IA <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-3">
        {INTERESTS_OPTIONS.map(opt => (
          <button key={opt.value}
            type="button"
            className={cn(
              "flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors focus:ring-2",
              (watch("interests") || []).includes(opt.value)
                ? "border-[#0ABAB5] bg-[#eafaf9] text-[#0ABAB5]"
                : "border-gray-200 bg-white text-gray-700"
            )}
            onClick={() => toggleSelect("interests", opt.value)}
          >
            <span className="material-symbols-rounded mr-1">
              <span className={`lucide lucide-${opt.icon}`} style={{ color: "#0ABAB5" }} />
            </span>
            {opt.label}
          </button>
        ))}
      </div>
      {errors.interests && <span className="text-xs text-red-500">Selecione pelo menos um interesse.</span>}
    </div>
  );
}
