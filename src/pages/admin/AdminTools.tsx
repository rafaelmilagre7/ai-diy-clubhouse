
import React, { useState } from "react";
import { useTools } from "@/hooks/useTools";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { AdminToolsHeader } from "@/components/admin/tools/AdminToolsHeader";

// Simple component to display tools list
const AdminToolList = ({ tools, refreshTrigger }: { tools: any[]; refreshTrigger: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <div key={tool.id} className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold">{tool.name}</h3>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
          <p className="text-xs text-muted-foreground mt-2">Categoria: {tool.category}</p>
        </div>
      ))}
    </div>
  );
};

const AdminTools = () => {
  const { tools, isLoading, error, refetch } = useTools();
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando ferramentas..." />;
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Ferramentas</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <h3 className="text-red-800 font-medium">Erro ao carregar ferramentas</h3>
          <p className="text-red-700 mt-1">{error.message}</p>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="mt-4"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <AdminToolsHeader onRefreshRequest={handleRefresh} />
      <AdminToolList tools={tools} refreshTrigger={refreshCounter} />
    </div>
  );
};

export default AdminTools;
