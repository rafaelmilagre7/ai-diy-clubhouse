
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, UserPlus, Trash2 } from "lucide-react";
import { ManualCleanupDialog } from "./ManualCleanupDialog";

interface UsersHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
}) => {
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, papéis e permissões do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCleanupDialogOpen(true)}
            variant="outline"
            size="sm"
            className="text-status-error border-status-error/30 hover:bg-status-error/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpeza Manual
          </Button>
          
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou empresa..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ManualCleanupDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  );
};
