
import React, { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Info, Link2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { availableTools, ToolItem } from "./toolsData";
import * as Icons from "lucide-react";

export interface SelectedTool extends ToolItem {
  is_required: boolean;
}

interface ToolSelectorProps {
  value: SelectedTool[];
  onChange: (tools: SelectedTool[]) => void;
  className?: string;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ value = [], onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelectTool = (tool: ToolItem) => {
    // Verificar se a ferramenta já está selecionada
    const toolIndex = value.findIndex(t => t.id === tool.id);
    
    if (toolIndex === -1) {
      // Adicionar ferramenta com is_required true por padrão
      onChange([...value, { ...tool, is_required: true }]);
    }
    
    setOpen(false);
    setSearch("");
  };

  const handleRemoveTool = (id: string) => {
    onChange(value.filter(tool => tool.id !== id));
  };

  const handleToggleRequired = (id: string, isRequired: boolean) => {
    onChange(
      value.map(tool => 
        tool.id === id ? { ...tool, is_required: isRequired } : tool
      )
    );
  };

  const renderIcon = (iconName?: keyof typeof Icons) => {
    if (!iconName) return null;
    
    const IconComponent = Icons[iconName] as React.ElementType;
    return IconComponent ? <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" /> : null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start border-dashed"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ferramenta
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" side="bottom" sideOffset={8} width={500}>
          <Command className="w-full">
            <CommandInput 
              placeholder="Buscar ferramenta..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Nenhuma ferramenta encontrada</CommandEmpty>
              <CommandGroup heading="Ferramentas disponíveis">
                <ScrollArea className="h-[300px]">
                  {availableTools
                    .filter(tool => !value.some(t => t.id === tool.id))
                    .map(tool => (
                      <CommandItem
                        key={tool.id}
                        value={`${tool.name} ${tool.description}`}
                        onSelect={() => handleSelectTool(tool)}
                        className="flex items-start py-2"
                      >
                        <div className="flex items-center mr-2 mt-0.5">
                          {renderIcon(tool.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {tool.description}
                          </div>
                        </div>
                      </CommandItem>
                    ))
                  }
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-4">
            <ScrollArea className={cn("h-auto", value.length > 5 && "h-[300px]")}>
              <div className="space-y-3">
                {value.map((tool) => (
                  <div key={tool.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/30 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {renderIcon(tool.icon)}
                        <span className="font-medium">{tool.name}</span>
                        {tool.is_required && (
                          <Badge variant="default" className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
                            Obrigatória
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <a 
                          href={tool.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-xs text-blue-500 hover:underline truncate"
                        >
                          <Link2 className="h-3 w-3 mr-1" /> 
                          {tool.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`required-${tool.id}`}
                          checked={tool.is_required}
                          onCheckedChange={(checked) => handleToggleRequired(tool.id, checked)}
                        />
                        <Label htmlFor={`required-${tool.id}`} className="text-sm cursor-pointer">
                          Obrigatória
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTool(tool.id)}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Remover</span>
                        <Icons.X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
