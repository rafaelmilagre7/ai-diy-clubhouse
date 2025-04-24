
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getPersonalInfoSummary } from "./review-sections/personalInfoSummary";
import { getProfessionalInfoSummary } from "./review-sections/professionalInfoSummary";
import { getBusinessContextSummary } from "./review-sections/businessContextSummary";
import { getAIExperienceSummary } from "./review-sections/aiExperienceSummary";
import { getBusinessGoalsSummary } from "./review-sections/businessGoalsSummary";
import { getExperiencePersonalizationSummary } from "./review-sections/experiencePersonalizationSummary";
import { getComplementaryInfoSummary } from "./review-sections/complementaryInfoSummary";

export function getSummary(section: string, data: any, progress: any) {
  // Garantir que os dados não são nulos ou indefinidos
  const safeData = data || {};
  
  // Log para debug
  console.log(`Renderizando summary para seção ${section} com dados:`, safeData);
  
  // Verificar se os dados são uma string JSON e tentar converter
  let processedData = safeData;
  if (typeof safeData === 'string' && safeData !== "{}" && safeData !== "") {
    try {
      processedData = JSON.parse(safeData);
      console.log(`Convertido dados de string para objeto na seção ${section}:`, processedData);
    } catch (e) {
      console.error(`Falha ao analisar string para objeto na seção ${section}:`, e);
      processedData = {};
    }
  }
  
  if (!data || Object.keys(processedData).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  switch (section) {
    case "personal_info":
      return getPersonalInfoSummary(processedData);
    case "professional_info":
      return getProfessionalInfoSummary(processedData);
    case "business_context":
      return getBusinessContextSummary(processedData);
    case "ai_experience":
      return getAIExperienceSummary(processedData);
    case "business_goals":
      return getBusinessGoalsSummary(processedData);
    case "experience_personalization":
      return getExperiencePersonalizationSummary(processedData);
    case "complementary_info":
      return getComplementaryInfoSummary(processedData);
    default:
      return renderDefaultSummary(processedData);
  }
}

function renderDefaultSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Dados não disponíveis ou não preenchidos.</p>;
  }
  
  return (
    <div className="space-y-1 text-sm text-gray-600">
      {Object.entries(data || {}).map(([key, value]) => {
        if (!value) return null;
        
        if (Array.isArray(value) && value.length > 0) {
          return renderArrayField(key, value);
        } else if (typeof value === 'boolean') {
          return renderBooleanField(key, value);
        } else if (value && typeof value !== 'object') {
          return renderSimpleField(key, value);
        } else if (typeof value === 'object' && value !== null) {
          return renderObjectField(key, value);
        }
        return null;
      })}
    </div>
  );
}

function renderArrayField(key: string, value: any[]) {
  return (
    <div key={key} className="mb-2">
      <span className="font-medium text-gray-700">{formatKey(key)}:</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {value.map((item: any, index: number) => (
          <Badge key={index} variant="outline" className="bg-gray-100">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function renderBooleanField(key: string, value: boolean) {
  return (
    <p key={key}>
      <span className="font-medium text-gray-700">{formatKey(key)}:</span> {value ? "Sim" : "Não"}
    </p>
  );
}

function renderSimpleField(key: string, value: any) {
  return (
    <p key={key}>
      <span className="font-medium text-gray-700">{formatKey(key)}:</span> {String(value)}
    </p>
  );
}

function renderObjectField(key: string, value: object) {
  if (Object.keys(value).length === 0) return null;
  
  return (
    <div key={key} className="mb-2">
      <span className="font-medium text-gray-700">{formatKey(key)}:</span>
      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-20">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function formatKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
