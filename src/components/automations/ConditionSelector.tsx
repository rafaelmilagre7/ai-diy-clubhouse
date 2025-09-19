import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface ConditionSelectorProps {
  ruleType: string;
  conditions: any;
  onChange: (conditions: any) => void;
}

export const ConditionSelector = ({ ruleType, conditions, onChange }: ConditionSelectorProps) => {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    conditions?.event_types || []
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    conditions?.products || []
  );
  const [customFilters, setCustomFilters] = useState<Record<string, any>>(
    conditions?.filters || {}
  );

  const hublaEventTypes = [
    { value: 'payment.approved', label: 'Pagamento Aprovado' },
    { value: 'payment.completed', label: 'Pagamento Concluído' },
    { value: 'subscription.created', label: 'Assinatura Criada' },
    { value: 'subscription.cancelled', label: 'Assinatura Cancelada' },
    { value: 'user.created', label: 'Usuário Criado' },
    { value: 'lead.abandoned_checkout', label: 'Checkout Abandonado' },
  ];

  const products = [
    { value: 'all', label: 'Todos os Produtos' },
    { value: 'N1bkE4pVIUtii35IAoNP', label: 'Plataforma Viver de IA' },
    // Adicionar mais produtos conforme necessário
  ];

  const updateConditions = (updates: Partial<any>) => {
    const newConditions = {
      trigger: ruleType === 'webhook' ? 'hubla_webhook' : ruleType,
      event_types: selectedEventTypes,
      products: selectedProducts,
      filters: customFilters,
      ...updates
    };
    onChange(newConditions);
  };

  const addEventType = (eventType: string) => {
    const newEventTypes = [...selectedEventTypes, eventType];
    setSelectedEventTypes(newEventTypes);
    updateConditions({ event_types: newEventTypes });
  };

  const removeEventType = (eventType: string) => {
    const newEventTypes = selectedEventTypes.filter(e => e !== eventType);
    setSelectedEventTypes(newEventTypes);
    updateConditions({ event_types: newEventTypes });
  };

  const addProduct = (product: string) => {
    const newProducts = [...selectedProducts, product];
    setSelectedProducts(newProducts);
    updateConditions({ products: newProducts });
  };

  const removeProduct = (product: string) => {
    const newProducts = selectedProducts.filter(p => p !== product);
    setSelectedProducts(newProducts);
    updateConditions({ products: newProducts });
  };

  const addCustomFilter = (key: string, value: any) => {
    const newFilters = { ...customFilters, [key]: value };
    setCustomFilters(newFilters);
    updateConditions({ filters: newFilters });
  };

  const removeCustomFilter = (key: string) => {
    const newFilters = { ...customFilters };
    delete newFilters[key];
    setCustomFilters(newFilters);
    updateConditions({ filters: newFilters });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condições</CardTitle>
        <CardDescription>
          Configure quando esta regra deve ser executada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {ruleType === 'webhook' && (
          <>
            {/* Event Types */}
            <div className="space-y-3">
              <Label>Tipos de Evento</Label>
              <div className="space-y-2">
                <Select onValueChange={addEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {hublaEventTypes
                      .filter(event => !selectedEventTypes.includes(event.value))
                      .map(event => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                
                {selectedEventTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedEventTypes.map(eventType => {
                      const event = hublaEventTypes.find(e => e.value === eventType);
                      return (
                        <Badge key={eventType} variant="secondary" className="flex items-center gap-1">
                          {event?.label || eventType}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeEventType(eventType)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-3">
              <Label>Produtos</Label>
              <div className="space-y-2">
                <Select onValueChange={addProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione produtos específicos" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(product => !selectedProducts.includes(product.value))
                      .map(product => (
                        <SelectItem key={product.value} value={product.value}>
                          {product.label}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.value === productId);
                      return (
                        <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                          {product?.label || productId}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeProduct(productId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {ruleType === 'schedule' && (
          <div className="space-y-3">
            <Label>Agendamento</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule_type">Tipo</Label>
                <Select onValueChange={(value) => addCustomFilter('schedule_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="schedule_time">Horário</Label>
                <Input
                  id="schedule_time"
                  type="time"
                  onChange={(e) => addCustomFilter('schedule_time', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom Filters */}
        <div className="space-y-3">
          <Label>Filtros Personalizados (JSON)</Label>
          <Textarea
            placeholder='{"key": "value", "another_key": "another_value"}'
            value={JSON.stringify(customFilters, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setCustomFilters(parsed);
                updateConditions({ filters: parsed });
              } catch {
                // Ignore invalid JSON while typing
              }
            }}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Filtros adicionais em formato JSON para condições específicas
          </p>
        </div>

        {/* Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Preview das Condições</Label>
          <pre className="text-xs mt-2 whitespace-pre-wrap">
            {JSON.stringify({
              trigger: ruleType === 'webhook' ? 'hubla_webhook' : ruleType,
              event_types: selectedEventTypes,
              products: selectedProducts,
              filters: customFilters
            }, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};