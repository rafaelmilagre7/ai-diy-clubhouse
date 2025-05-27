
import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface NetworkingFiltersProps {
  filters: {
    sector: string;
    companySize: string;
    location: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const NetworkingFilters: React.FC<NetworkingFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sector: '',
      companySize: '',
      location: '',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.sector || filters.companySize || filters.location || filters.status !== 'all';

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Setor</label>
          <Select value={filters.sector} onValueChange={(value) => handleFilterChange('sector', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os setores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os setores</SelectItem>
              <SelectItem value="tecnologia">Tecnologia</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="varejo">Varejo</SelectItem>
              <SelectItem value="manufatura">Manufatura</SelectItem>
              <SelectItem value="servicos">Serviços</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tamanho da Empresa</label>
          <Select value={filters.companySize} onValueChange={(value) => handleFilterChange('companySize', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tamanhos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tamanhos</SelectItem>
              <SelectItem value="startup">Startup (1-10)</SelectItem>
              <SelectItem value="pequena">Pequena (11-50)</SelectItem>
              <SelectItem value="media">Média (51-200)</SelectItem>
              <SelectItem value="grande">Grande (201-1000)</SelectItem>
              <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Localização</label>
          <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as localizações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as localizações</SelectItem>
              <SelectItem value="sp">São Paulo</SelectItem>
              <SelectItem value="rj">Rio de Janeiro</SelectItem>
              <SelectItem value="mg">Minas Gerais</SelectItem>
              <SelectItem value="rs">Rio Grande do Sul</SelectItem>
              <SelectItem value="pr">Paraná</SelectItem>
              <SelectItem value="sc">Santa Catarina</SelectItem>
              <SelectItem value="outros">Outros Estados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="viewed">Visualizados</SelectItem>
              <SelectItem value="contacted">Contatados</SelectItem>
              <SelectItem value="dismissed">Dispensados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
