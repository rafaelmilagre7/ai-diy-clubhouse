
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ListBlockProps {
  data: {
    items: string[];
  };
  onChange: (data: any) => void;
}

const ListBlock: React.FC<ListBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      {data.items.map((item: string, itemIndex: number) => (
        <div key={itemIndex} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const updatedItems = [...data.items];
              updatedItems[itemIndex] = e.target.value;
              onChange({ items: updatedItems });
            }}
            placeholder={`Item ${itemIndex + 1}`}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const updatedItems = data.items.filter((_: any, i: number) => i !== itemIndex);
              onChange({ items: updatedItems });
            }}
          >
            -
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const updatedItems = [...data.items, `Item ${data.items.length + 1}`];
          onChange({ items: updatedItems });
        }}
      >
        + Adicionar Item
      </Button>
    </div>
  );
};

export default ListBlock;
