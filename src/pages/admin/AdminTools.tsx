
import React from "react";
import { useTools } from "@/hooks/useTools";
import { AdminToolList } from "@/components/admin/tools/AdminToolList";
import { AdminToolsHeader } from "@/components/admin/tools/AdminToolsHeader";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

const AdminTools = () => {
  const { tools, error, refetch } = useTools();

  const handleRefresh = () => {
    refetch();
  };

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
      <AdminToolList tools={tools} />
    </div>
  );
};

export default AdminTools;
