
import React from "react";
import { Control, Controller, UseFormWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

interface DynamicItemsInputProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  buttonText?: string;
  maxItems?: number;
  watch: UseFormWatch<any>;
}

export const DynamicItemsInput: React.FC<DynamicItemsInputProps> = ({
  control,
  name,
  label,
  placeholder = "Digite um item...",
  buttonText = "Adicionar item",
  maxItems = 10,
  watch
}) => {
  const items = watch(name) || [""];

  const addItem = () => {
    if (items.length < maxItems) {
      return [...items, ""];
    }
    return items;
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      return [""];
    }
    return items.filter((_, i) => i !== index);
  };

  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium text-white">{label}</Label>
      
      <div className="space-y-2">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    placeholder={placeholder}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index] = e.target.value;
                      field.onChange(newItems);
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => field.onChange(removeItem(index))}
                    disabled={items.length === 1 && !items[0]}
                    className="h-10 w-10 text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              
              {items.length < maxItems && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => field.onChange(addItem())}
                  className="mt-2 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {buttonText}
                </Button>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
};
