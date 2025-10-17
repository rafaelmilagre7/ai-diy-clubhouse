
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem } from "@/components/ui/form";

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ChecklistBlockProps {
  data: {
    items: ChecklistItem[];
  };
  onChange: (data: any) => void;
}

const ChecklistBlock: React.FC<ChecklistBlockProps> = ({ data, onChange }) => {
  const updateItem = (index: number, field: keyof ChecklistItem, value: any) => {
    const newItems = [...data.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    onChange({ items: newItems });
  };

  const addItem = () => {
    onChange({
      items: [...data.items, { text: "", checked: false }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    onChange({ items: newItems });
  };

  return (
    <div className="space-y-3">
      {data.items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 border p-3 rounded-md">
          <div className="flex items-center gap-3 w-full">
            <Checkbox
              checked={item.checked}
              onCheckedChange={(checked) => updateItem(index, "checked", checked)}
              id={`checklist-item-${index}`}
              className="h-5 w-5"
            />
            <div className="flex-1">
              <Input
                value={item.text}
                onChange={(e) => updateItem(index, "text", e.target.value)}
                placeholder="Item da checklist..."
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
        </div>
      ))}
      
      <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Item
      </Button>
      
      <div className="mt-4 p-4 border border-system-healthy/20 bg-system-healthy/10 rounded">
        <h4 className="font-bold text-system-healthy mb-3">Checklist de Verificação</h4>
        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <Checkbox 
                id={`preview-item-${index}`} 
                checked={item.checked}
                className="mt-0.5 h-5 w-5 border-system-healthy"
                disabled
              />
              <Label 
                htmlFor={`preview-item-${index}`} 
                className="text-system-healthy font-medium cursor-pointer"
              >
                {item.text || "Item da checklist..."}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChecklistBlock;
