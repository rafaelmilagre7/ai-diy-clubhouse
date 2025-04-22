
import React from "react";

export function getExperiencePersonalizationSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      {data.interests && data.interests.length > 0 && (
        <div>
          <p className="font-medium">Interesses:</p>
          <ul className="list-disc pl-5">
            {data.interests.map((interest: string, index: number) => (
              <li key={index}>{interest}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.time_preference && data.time_preference.length > 0 && (
        <div>
          <p className="font-medium">Preferência de horário:</p>
          <ul className="list-disc pl-5">
            {data.time_preference.map((time: string, index: number) => (
              <li key={index}>{time}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.available_days && data.available_days.length > 0 && (
        <div>
          <p className="font-medium">Dias disponíveis:</p>
          <ul className="list-disc pl-5">
            {data.available_days.map((day: string, index: number) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.networking_availability !== undefined && (
        <p>
          <span className="font-medium">Disponibilidade para networking:</span> {data.networking_availability}/10
        </p>
      )}
      
      {data.skills_to_share && data.skills_to_share.length > 0 && (
        <div>
          <p className="font-medium">Habilidades para compartilhar:</p>
          <ul className="list-disc pl-5">
            {data.skills_to_share.map((skill: string, index: number) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.mentorship_topics && data.mentorship_topics.length > 0 && (
        <div>
          <p className="font-medium">Tópicos de mentoria:</p>
          <ul className="list-disc pl-5">
            {data.mentorship_topics.map((topic: string, index: number) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
