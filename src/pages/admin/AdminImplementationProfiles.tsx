
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useImplementationProfiles } from "@/hooks/admin/useImplementationProfiles";
import { ImplementationProfilesTable } from "@/components/admin/implementation-profiles/ImplementationProfilesTable";
import { useNavigate } from "react-router-dom";

const AdminImplementationProfiles = () => {
  const navigate = useNavigate();
  const { 
    profiles,
    isLoading,
    searchTerm,
    setSearchTerm
  } = useImplementationProfiles();

  const handleViewProfile = (id: string) => {
    navigate(`/admin/implementation-profiles/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Perfis de Implementação
        </h1>
        <p className="text-muted-foreground">
          Gerencie os perfis de implementação dos membros do VIVER DE IA Club.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando perfis...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm 
              ? "Nenhum perfil encontrado para esta busca." 
              : "Nenhum perfil de implementação cadastrado."}
          </p>
        </div>
      ) : (
        <ImplementationProfilesTable 
          profiles={profiles}
          onViewProfile={handleViewProfile}
        />
      )}
    </div>
  );
};

export default AdminImplementationProfiles;
