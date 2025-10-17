
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WarningBlockProps {
  data: {
    title: string;
    text: string;
  };
  onChange: (data: any) => void;
}

const WarningBlock: React.FC<WarningBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <Input
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Título do aviso"
      />
      <Textarea
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Texto do aviso..."
        className="min-h-[100px]"
      />
      
      <div className="mt-4 p-4 border-l-4 border-status-warning bg-status-warning-lighter rounded">
        <h4 className="font-bold text-status-warning">{data.title || "Atenção"}</h4>
        <p className="text-status-warning mt-1">{data.text || "Texto do aviso irá aparecer aqui."}</p>
      </div>
    </div>
  );
};

export default WarningBlock;
