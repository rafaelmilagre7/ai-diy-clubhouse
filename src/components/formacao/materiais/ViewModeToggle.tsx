import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3, List, TreePine, Download } from "lucide-react";
import { ViewMode } from "./types";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedCount?: number;
  onBulkDownload?: () => void;
}

export const ViewModeToggle = ({ 
  viewMode, 
  onViewModeChange, 
  selectedCount = 0,
  onBulkDownload 
}: ViewModeToggleProps) => {
  
  const viewModes = [
    { 
      key: 'grid' as ViewMode, 
      icon: Grid3X3, 
      label: 'Grid',
      description: 'Visualização em cards'
    },
    { 
      key: 'list' as ViewMode, 
      icon: List, 
      label: 'Lista',
      description: 'Visualização em tabela'
    },
    { 
      key: 'hierarchy' as ViewMode, 
      icon: TreePine, 
      label: 'Hierarquia',
      description: 'Organização por curso'
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-card/80 to-card/60 border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {viewModes.map(({ key, icon: Icon, label, description }) => (
              <Button
                key={key}
                variant={viewMode === key ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange(key)}
                className={`h-10 px-4 ${
                  viewMode === key 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted/50"
                }`}
                title={description}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>

          {/* Ações em lote */}
          <div className="flex items-center space-x-2">
            {selectedCount > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-lg">
                <span className="text-sm text-primary font-medium">
                  {selectedCount} selecionados
                </span>
              </div>
            )}
            
            {onBulkDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDownload}
                disabled={selectedCount === 0}
                className="h-10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download em lote
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};