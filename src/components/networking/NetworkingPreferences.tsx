import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Users, 
  Target, 
  Bell, 
  Shield, 
  Brain,
  Building2,
  MapPin,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNetworkingPreferences } from '@/hooks/useNetworkingPreferences';
import { useToast } from '@/hooks/use-toast';

const MATCH_TYPES = [
  { value: 'customer', label: 'Potenciais Clientes', icon: Users },
  { value: 'supplier', label: 'Fornecedores', icon: Building2 },
  { value: 'partner', label: 'Parceiros Estratégicos', icon: Target },
  { value: 'mentor', label: 'Mentores', icon: Brain },
];

const INDUSTRIES = [
  'Tecnologia', 'Saúde', 'Educação', 'Finanças', 'Varejo', 
  'Consultoria', 'Manufatura', 'Agricultura', 'Energia', 'Imobiliário'
];

const COMPANY_SIZES = [
  'Startup (1-10)', 'Pequena (11-50)', 'Média (51-200)', 
  'Grande (201-1000)', 'Corporação (1000+)'
];

const LOCATIONS = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília',
  'Porto Alegre', 'Curitiba', 'Salvador', 'Fortaleza', 'Recife'
];

export const NetworkingPreferences = () => {
  const { preferences, isLoading, updatePreferences, createDefaultPreferences, isUpdating } = useNetworkingPreferences();
  const { toast } = useToast();
  
  const [localPrefs, setLocalPrefs] = useState({
    lookingFor: {
      types: [] as string[],
      industries: [] as string[],
      companySizes: [] as string[],
      locations: [] as string[]
    },
    excludeSectors: [] as string[],
    minCompatibility: 70,
    connectionsPerWeek: 5,
    isActive: true
  });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        lookingFor: preferences.looking_for || {
          types: [],
          industries: [],
          companySizes: [],
          locations: []
        },
        excludeSectors: preferences.exclude_sectors || [],
        minCompatibility: Math.round((preferences.min_compatibility || 0.7) * 100),
        connectionsPerWeek: preferences.preferred_connections_per_week || 5,
        isActive: preferences.is_active ?? true
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      if (!preferences) {
        // Criar preferências padrão primeiro
        await createDefaultPreferences();
      }
      
      await updatePreferences({
        looking_for: localPrefs.lookingFor,
        exclude_sectors: localPrefs.excludeSectors,
        min_compatibility: localPrefs.minCompatibility / 100,
        preferred_connections_per_week: localPrefs.connectionsPerWeek,
        is_active: localPrefs.isActive
      });

      toast({
        title: "Preferências salvas!",
        description: "Suas configurações de networking foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-aurora-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
            <Settings className="h-5 w-5 text-aurora-primary" />
            Preferências de Networking
          </h2>
          <p className="text-sm text-textSecondary">
            Configure suas preferências para receber matches mais precisos
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-aurora-primary hover:bg-aurora-primary/90 text-white"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Preferências
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipos de Match */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-aurora-primary" />
              Tipos de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MATCH_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = localPrefs.lookingFor.types.includes(type.value);
              
              return (
                <motion.div
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-aurora-primary bg-aurora-primary/10' 
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                    onClick={() => setLocalPrefs(prev => ({
                      ...prev,
                      lookingFor: {
                        ...prev.lookingFor,
                        types: toggleArrayItem(prev.lookingFor.types, type.value)
                      }
                    }))}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-aurora-primary' : 'text-neutral-400'}`} />
                      <span className={`text-sm ${isSelected ? 'text-aurora-primary' : 'text-textPrimary'}`}>
                        {type.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-aurora-primary" />
              Configurações IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Compatibilidade Mínima: {localPrefs.minCompatibility}%
                </Label>
                <Slider
                  value={[localPrefs.minCompatibility]}
                  onValueChange={(value) => setLocalPrefs(prev => ({
                    ...prev,
                    minCompatibility: value[0]
                  }))}
                  min={50}
                  max={95}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-textSecondary mt-1">
                  Apenas matches acima desta compatibilidade serão mostrados
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Conexões por Semana: {localPrefs.connectionsPerWeek}
                </Label>
                <Slider
                  value={[localPrefs.connectionsPerWeek]}
                  onValueChange={(value) => setLocalPrefs(prev => ({
                    ...prev,
                    connectionsPerWeek: value[0]
                  }))}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-textSecondary mt-1">
                  Limite de novas conexões por semana
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Networking Ativo</Label>
                  <p className="text-xs text-textSecondary">
                    Receber novos matches automaticamente
                  </p>
                </div>
                <Switch
                  checked={localPrefs.isActive}
                  onCheckedChange={(checked) => setLocalPrefs(prev => ({
                    ...prev,
                    isActive: checked
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setores de Interesse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-aurora-primary" />
              Setores de Interesse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => {
                const isSelected = localPrefs.lookingFor.industries.includes(industry);
                return (
                  <Badge
                    key={industry}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-aurora-primary hover:bg-aurora-primary/90' 
                        : 'hover:bg-neutral-800'
                    }`}
                    onClick={() => setLocalPrefs(prev => ({
                      ...prev,
                      lookingFor: {
                        ...prev.lookingFor,
                        industries: toggleArrayItem(prev.lookingFor.industries, industry)
                      }
                    }))}
                  >
                    {industry}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-aurora-primary" />
              Localização Preferida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((location) => {
                const isSelected = localPrefs.lookingFor.locations.includes(location);
                return (
                  <Badge
                    key={location}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-aurora-primary hover:bg-aurora-primary/90' 
                        : 'hover:bg-neutral-800'
                    }`}
                    onClick={() => setLocalPrefs(prev => ({
                      ...prev,
                      lookingFor: {
                        ...prev.lookingFor,
                        locations: toggleArrayItem(prev.lookingFor.locations, location)
                      }
                    }))}
                  >
                    {location}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};