
import React from "react";

export function getComplementaryInfoSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-medium">Como nos conheceu:</span> {data.how_found_us || data.how_discovered || "Não preenchido"}
      </p>
      
      {(data.referred_by || data.referral_name) && (
        <p><span className="font-medium">Indicado por:</span> {data.referred_by || data.referral_name}</p>
      )}
      
      <p>
        <span className="font-medium">Autoriza uso de case:</span> {
          data.authorize_case_usage || data.authorize_case_studies
            ? "Sim"
            : "Não"
        }
      </p>
      
      <p>
        <span className="font-medium">Interesse em entrevista:</span> {
          data.interested_in_interview || data.interested_in_interviews
            ? "Sim"
            : "Não"
        }
      </p>
      
      {data.priority_topics && data.priority_topics.length > 0 && (
        <div>
          <p className="font-medium">Tópicos prioritários:</p>
          <ul className="list-disc pl-5">
            {data.priority_topics.map((topic: string, index: number) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        </div>
      )}

      {data.authorize_testimonials !== undefined && (
        <p>
          <span className="font-medium">Autoriza depoimentos:</span> {
            data.authorize_testimonials ? "Sim" : "Não"
          }
        </p>
      )}
    </div>
  );
}
