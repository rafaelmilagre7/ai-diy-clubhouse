
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Clock, FileText, Calendar } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';

interface InviteSettingsStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

const EXPIRATION_OPTIONS = [
  { value: '1 day', label: '1 dia', description: 'Expira em 24 horas' },
  { value: '3 days', label: '3 dias', description: 'Expira em 72 horas' },
  { value: '7 days', label: '7 dias', description: 'Expira em 1 semana (padrão)' },
  { value: '14 days', label: '14 dias', description: 'Expira em 2 semanas' },
  { value: '30 days', label: '30 dias', description: 'Expira em 1 mês' },
];

export const InviteSettingsStep = ({ formData, onUpdate }: InviteSettingsStepProps) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Configurações Adicionais</h3>
        <p className="text-sm text-gray-600 mt-1">
          Defina configurações opcionais para o convite
        </p>
      </div>

      <div className="space-y-6">
        {/* Expiração */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-viverblue" />
              Prazo de Expiração
            </CardTitle>
            <CardDescription>
              Defina quando o convite expira
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiration" className="text-sm font-medium">
                Expira em
              </Label>
              <Select
                value={formData.expiresIn || '7 days'}
                onValueChange={(value) => onUpdate({ expiresIn: value })}
              >
                <SelectTrigger id="expiration">
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Dica:</strong> Convites com prazo menor têm maior taxa de resposta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-viverblue" />
              Observações e Notas
            </CardTitle>
            <CardDescription>
              Adicione informações extras que aparecerão no convite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Mensagem personalizada
              </Label>
              <Textarea
                id="notes"
                placeholder="Ex: Bem-vindo ao Viver de IA! Estamos ansiosos para ter você em nossa comunidade..."
                value={formData.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Esta mensagem aparecerá destacada no email de convite (opcional)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="bg-gray-50 rounded p-3">
                <p className="font-medium mb-1">✅ Recomendado:</p>
                <ul className="space-y-1">
                  <li>• Mensagem de boas-vindas</li>
                  <li>• Próximos passos</li>
                  <li>• Informações importantes</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="font-medium mb-1">❌ Evite:</p>
                <ul className="space-y-1">
                  <li>• Informações confidenciais</li>
                  <li>• Textos muito longos</li>
                  <li>• Links externos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
