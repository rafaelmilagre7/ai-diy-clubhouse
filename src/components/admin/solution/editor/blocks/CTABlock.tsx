
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

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
    <div className="space-y-4">
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
      
      <div className="grid grid-cols-2 gap-3">
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
      </div>
      
      <div className="mt-6 p-6 rounded-lg border border-indigo-200 bg-indigo-50">
        <div className="max-w-lg mx-auto text-center">
          <h3 className="font-bold text-xl text-indigo-800 mb-3">
            {data.title || "Próximos Passos"}
          </h3>
          <p className="mb-6 text-indigo-600">
            {data.text || "Texto da chamada para ação irá aparecer aqui."}
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors">
            {data.buttonText || "Continuar"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTABlock;
