
import React from 'react';
import { NetworkMatchCard } from '@/components/networking/NetworkMatchCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users } from 'lucide-react';
import { useNetworkingProfiles } from '@/hooks/networking/useNetworkingProfiles';

const NetworkingPage = () => {
  const [compatibilityFilter, setCompatibilityFilter] = React.useState('all');
  const { data: profiles, isLoading } = useNetworkingProfiles(compatibilityFilter);

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Networking</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Conecte-se com outros membros baseado em interesses e habilidades complementares
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Select 
            value={compatibilityFilter} 
            onValueChange={setCompatibilityFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por compatibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              <SelectItem value="high">Alta compatibilidade</SelectItem>
              <SelectItem value="medium">Média compatibilidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : profiles?.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <h3 className="text-lg font-semibold">Nenhum membro encontrado</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Não encontramos outros membros com base no filtro atual. Tente alterar o filtro ou volte mais tarde.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {profiles?.map((profile) => (
            <NetworkMatchCard 
              key={profile.matched_user_id} 
              match={profile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkingPage;
