
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

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
      
      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm text-muted-foreground">Benefícios:</h4>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Benefício
          </Button>
        </div>
        
        {data.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 border p-3 rounded-md">
          <div className="flex items-center gap-2 flex-1">
            <CheckCircle2 className="h-5 w-5 text-system-healthy flex-shrink-0" />
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder="Descreva um benefício..."
                className="flex-1"
              />
            </div>
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
      </div>
      
      <div className="mt-6 p-6 border border-system-healthy/20 bg-system-healthy/10 rounded-lg">
        <h3 className="font-bold text-xl text-system-healthy mb-4">{data.title || "Benefícios"}</h3>
        <ul className="space-y-3">
          {data.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-system-healthy mt-0.5 flex-shrink-0" />
              <span className="text-system-healthy">{item || "Descrição do benefício"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BenefitsBlock;
