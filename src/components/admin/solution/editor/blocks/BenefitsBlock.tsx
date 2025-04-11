
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface BenefitsBlockProps {
  data: {
    title: string;
    items: string[];
  };
  onChange: (data: any) => void;
}

const BenefitsBlock: React.FC<BenefitsBlockProps> = ({ data, onChange }) => {
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
        placeholder="Título dos benefícios"
      />
      
      {data.items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder="Descreva um benefício..."
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
        Adicionar Benefício
      </Button>
      
      <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded">
        <h4 className="font-bold text-green-800">{data.title || "Benefícios"}</h4>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          {data.items.map((item, index) => (
            <li key={index} className="text-green-700">{item || "Descrição do benefício"}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BenefitsBlock;
