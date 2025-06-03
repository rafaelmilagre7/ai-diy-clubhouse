
import React from "react";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface SolutionBlockRendererProps {
  block: any;
}

export const SolutionBlockRenderer = ({ block }: SolutionBlockRendererProps) => {
  if (!block || !block.type) {
    return null;
  }

  const { type, data } = block;

  switch (type) {
    case "header":
      const HeaderTag = `h${data?.level || 3}` as keyof JSX.IntrinsicElements;
      return (
        <HeaderTag className="font-semibold text-textPrimary mb-3">
          {data?.text || ""}
        </HeaderTag>
      );

    case "paragraph":
      return (
        <p className="text-textSecondary leading-relaxed whitespace-pre-wrap">
          {data?.text || ""}
        </p>
      );

    case "list":
      return (
        <ul className="space-y-2 text-textSecondary">
          {(data?.items || []).map((item: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-viverblue mr-2">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "image":
      return (
        <div className="space-y-2">
          <img 
            src={data?.url || ""} 
            alt={data?.alt || ""} 
            className="max-w-full h-auto rounded-lg border border-white/10"
          />
          {data?.caption && (
            <p className="text-sm text-textSecondary text-center italic">
              {data.caption}
            </p>
          )}
        </div>
      );

    case "youtube":
      return (
        <div className="space-y-2">
          <YoutubeEmbed youtubeId={data?.youtubeId || ""} />
          {data?.caption && (
            <p className="text-sm text-textSecondary text-center italic">
              {data.caption}
            </p>
          )}
        </div>
      );

    case "video":
      return (
        <div className="space-y-2">
          <video 
            src={data?.url || ""} 
            controls 
            className="w-full max-w-full rounded-lg border border-white/10"
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
          {data?.caption && (
            <p className="text-sm text-textSecondary text-center italic">
              {data.caption}
            </p>
          )}
        </div>
      );

    case "code":
      return (
        <div className="space-y-2">
          <pre className="bg-backgroundDark p-4 rounded-lg border border-white/10 overflow-auto">
            <code className="text-sm text-green-400">
              {data?.code || ""}
            </code>
          </pre>
          {data?.language && (
            <p className="text-xs text-textSecondary">
              Linguagem: {data.language}
            </p>
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-viverblue pl-4 py-2 bg-blue-900/20 rounded-r-lg">
          <p className="text-textSecondary italic">"{data?.text || ""}"</p>
          {data?.caption && (
            <cite className="text-sm text-textSecondary block mt-2">
              — {data.caption}
            </cite>
          )}
        </blockquote>
      );

    case "checklist":
      return (
        <div className="space-y-2">
          {(data?.items || []).map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={item.checked || false}
                readOnly
                className="rounded border-white/20"
              />
              <span className="text-textSecondary">{item.text || ""}</span>
            </div>
          ))}
        </div>
      );

    case "warning":
      return (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <h5 className="font-medium text-yellow-400 mb-2">
            ⚠️ {data?.title || "Atenção"}
          </h5>
          <p className="text-yellow-200">{data?.text || ""}</p>
        </div>
      );

    case "benefits":
      return (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <h5 className="font-medium text-green-400 mb-3">
            ✅ {data?.title || "Benefícios"}
          </h5>
          <ul className="space-y-2">
            {(data?.items || []).map((item: string, index: number) => (
              <li key={index} className="flex items-start text-green-200">
                <span className="text-green-400 mr-2">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return (
        <div className="bg-gray-800/50 p-3 rounded border border-white/10">
          <p className="text-xs text-textSecondary">
            Tipo de bloco não suportado: {type}
          </p>
        </div>
      );
  }
};
