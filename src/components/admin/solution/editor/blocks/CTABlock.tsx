
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CTABlockProps {
  data: {
    title: string;
    text: string;
    buttonText: string;
    buttonLink: string;
  };
  onChange: (data: any) => void;
}

const CTABlock: React.FC<CTABlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <Input
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Título da chamada para ação"
      />
      
      <Textarea
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Texto da chamada para ação..."
        className="min-h-[80px]"
      />
      
      <Input
        value={data.buttonText}
        onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
        placeholder="Texto do botão"
      />
      
      <Input
        value={data.buttonLink}
        onChange={(e) => onChange({ ...data, buttonLink: e.target.value })}
        placeholder="Link do botão (URL ou caminho)"
      />
      
      <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded text-center">
        <h4 className="font-bold text-xl text-blue-800">{data.title || "Próximos Passos"}</h4>
        <p className="mt-2 mb-4 text-blue-700">{data.text || "Texto da chamada para ação irá aparecer aqui."}</p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
          {data.buttonText || "Continuar"}
        </button>
      </div>
    </div>
  );
};

export default CTABlock;
