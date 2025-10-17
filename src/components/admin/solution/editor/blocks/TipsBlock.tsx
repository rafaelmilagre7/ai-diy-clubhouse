
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface TipsBlockProps {
  data: {
    title: string;
    items: string[];
  };
  onChange: (data: any) => void;
}

const TipsBlock: React.FC<TipsBlockProps> = ({ data, onChange }) => {
  const updateItem = (index: number, value: string) => {
    const newItems = [...data.items];
    newItems[index] = value;
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    onChange({
      ...data,
      items: [...data.items, ""]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-3">
      <Input
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Título das dicas"
      />
      
      {data.items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder="Descreva uma dica de otimização..."
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(index)}
            disabled={data.items.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Dica
      </Button>
      
      <div className="mt-4 p-4 border border-status-info/30 bg-status-info-lighter rounded">
        <h4 className="font-bold text-status-info">{data.title || "Dicas de Otimização"}</h4>
        <ul className="mt-2 space-y-2">
          {data.items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-status-info font-bold mr-2">💡</span>
              <span className="text-status-info">{item || "Descrição da dica de otimização"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TipsBlock;
