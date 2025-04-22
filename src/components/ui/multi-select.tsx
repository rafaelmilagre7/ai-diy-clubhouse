
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type OptionType = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: OptionType[];
  selected?: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
  maxItems?: number;
  defaultValue?: string[];
};

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Selecione as opções",
  maxItems,
  defaultValue = [],
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<string[]>(defaultValue);

  React.useEffect(() => {
    if (selected) {
      setSelectedItems(selected);
    }
  }, [selected]);

  const handleUnselect = (item: string) => {
    const filtered = selectedItems.filter((i) => i !== item);
    setSelectedItems(filtered);
    onChange(filtered);
  };

  const handleSelect = (value: string) => {
    // Verificar o limite máximo de itens
    if (maxItems && selectedItems.length >= maxItems && !selectedItems.includes(value)) {
      return;
    }

    const newSelected = selectedItems.includes(value)
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];
    
    setSelectedItems(newSelected);
    onChange(newSelected);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = e;
    
    // Remover o último item selecionado quando pressionar Backspace com o input vazio
    if (key === "Backspace" && !inputValue && selectedItems.length > 0) {
      const newSelected = [...selectedItems];
      newSelected.pop();
      setSelectedItems(newSelected);
      onChange(newSelected);
    }

    // Evitar que o Escape feche o popover
    if (key === "Escape") {
      e.stopPropagation();
    }
  };

  // Filtra as opções com base no texto digitado
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const selectableOptions = maxItems && selectedItems.length >= maxItems
    ? options.filter(option => selectedItems.includes(option.value))
    : filteredOptions;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className
          )}
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => {
                const option = options.find((o) => o.value === item);
                return (
                  <Badge 
                    key={item} 
                    variant="secondary"
                    className="px-2 py-1 flex items-center gap-1"
                  >
                    {option?.label || item}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {/* Aqui está o problema: usar o input diretamente em vez do CommandPrimitive.Input */}
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder=""
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" sideOffset={5}>
        <Command className="max-h-[300px] overflow-y-auto">
          <CommandGroup className="max-h-full overflow-auto">
            {maxItems && selectedItems.length >= maxItems && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Máximo de {maxItems} itens selecionados
              </p>
            )}
            {selectableOptions.length > 0 ? (
              selectableOptions.map((option) => {
                const isSelected = selectedItems.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5",
                      isSelected ? "bg-accent/50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : ""
                      )}
                    >
                      {isSelected && <X className="h-3 w-3" />}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })
            ) : (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Nenhuma opção encontrada
              </p>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
