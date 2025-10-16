import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface AutomationBasicInfoProps {
  register: any;
  errors: any;
  watchedValues: any;
  setValue: any;
}

export const AutomationBasicInfo = ({ 
  register, 
  errors, 
  watchedValues, 
  setValue
}: AutomationBasicInfoProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Configure o nome, descrição e configurações principais da automação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome da Automação *
            </Label>
            <Input
              id="name"
              placeholder="Ex: Boas-vindas automáticas Hubla"
              {...register('name', { required: 'Nome é obrigatório' })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.name.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Use um nome descritivo que explique o que a automação faz
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente o que esta automação faz e quando é executada..."
              rows={3}
              {...register('description')}
            />
            <p className="text-xs text-muted-foreground">
              Ajuda outros administradores a entender o propósito da automação
            </p>
          </div>

          {/* Rule Type */}
          <div className="space-y-2">
            <Label htmlFor="rule_type" className="text-sm font-medium">
              Tipo de Acionamento *
            </Label>
            <Select
              value={watchedValues.rule_type}
              onValueChange={(value) => setValue('rule_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webhook">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Webhook</span>
                    <span className="text-xs text-muted-foreground">
                      Executada quando recebe eventos externos (Hubla, etc.)
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="schedule">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Agendada</span>
                    <span className="text-xs text-muted-foreground">
                      Executada em horários específicos
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Manual</span>
                    <span className="text-xs text-muted-foreground">
                      Executada apenas quando acionada manualmente
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define como e quando a automação será executada
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Prioridade
              </Label>
              <Select
                value={watchedValues.priority?.toString()}
                onValueChange={(value) => setValue('priority', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Alta (1)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Média-Alta (2)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Média (3)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Média-Baixa (4)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span>Baixa (5)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Prioridade 1 executa primeiro que prioridade 5
              </p>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status Inicial</Label>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    {watchedValues.is_active ? 'Ativa' : 'Inativa'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {watchedValues.is_active 
                      ? 'Automação funcionará imediatamente após salvar'
                      : 'Automação ficará pausada até ser ativada manualmente'
                    }
                  </div>
                </div>
                <Switch
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-2">Resumo da Configuração</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {watchedValues.rule_type}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={watchedValues.is_active ? "default" : "secondary"} 
                  className="ml-2 text-xs"
                >
                  {watchedValues.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};