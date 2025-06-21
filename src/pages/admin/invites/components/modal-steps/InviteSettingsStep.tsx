
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Clock, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';

interface InviteSettingsStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

const EXPIRATION_OPTIONS = [
  { value: '1 day', label: '1 dia', description: 'Expira em 24 horas', color: 'bg-red-100 text-red-800' },
  { value: '3 days', label: '3 dias', description: 'Expira em 72 horas', color: 'bg-orange-100 text-orange-800' },
  { value: '7 days', label: '7 dias', description: 'Expira em 1 semana (recomendado)', color: 'bg-green-100 text-green-800' },
  { value: '14 days', label: '14 dias', description: 'Expira em 2 semanas', color: 'bg-blue-100 text-blue-800' },
  { value: '30 days', label: '30 dias', description: 'Expira em 1 mês', color: 'bg-purple-100 text-purple-800' },
];

export const InviteSettingsStep = ({ formData, onUpdate }: InviteSettingsStepProps) => {
  const selectedOption = EXPIRATION_OPTIONS.find(opt => opt.value === formData.expiresIn);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Configurações Adicionais</h3>
        <p className="text-gray-600">
          Defina o prazo de expiração e adicione observações opcionais
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Expiração */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              Prazo de Expiração
            </CardTitle>
            <CardDescription className="text-gray-600">
              Defina quando o convite expira automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="expiration" className="text-sm font-medium text-gray-900">
                Expira em
              </Label>
              <Select
                value={formData.expiresIn || '7 days'}
                onValueChange={(value) => onUpdate({ expiresIn: value })}
              >
                <SelectTrigger id="expiration" className="border-gray-200 focus:border-[#0ABAB5] focus:ring-[#0ABAB5]/20 bg-white text-gray-900">
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {EXPIRATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-900 hover:bg-gray-50">
                      <div className="flex items-center gap-3 w-full">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                          {option.label}
                        </div>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOption && (
              <div className={`p-4 rounded-lg border ${
                selectedOption.value === '7 days' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  {selectedOption.value === '7 days' ? (
                    <Calendar className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <p className={`text-sm font-medium ${
                    selectedOption.value === '7 days' ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {selectedOption.value === '7 days' 
                      ? '✅ Prazo recomendado - equilíbrio entre urgência e flexibilidade'
                      : selectedOption.value === '1 day' || selectedOption.value === '3 days'
                      ? '⚡ Prazo curto - alta urgência, pode reduzir taxa de resposta'
                      : '📅 Prazo longo - mais flexível, mas menor senso de urgência'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Mensagem Personalizada
            </CardTitle>
            <CardDescription className="text-gray-600">
              Adicione uma mensagem que aparecerá no convite
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-900">
                Observações especiais (opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ex: Bem-vindo ao Viver de IA! Estamos ansiosos para ter você em nossa comunidade e compartilhar conhecimentos sobre inteligência artificial..."
                value={formData.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                rows={5}
                className="resize-none border-gray-200 focus:border-[#0ABAB5] focus:ring-[#0ABAB5]/20 bg-white text-gray-900"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Esta mensagem aparecerá destacada no email de convite
                </p>
                <span className="text-xs text-gray-400">
                  {formData.notes?.length || 0}/500
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              💡 Dicas para uma mensagem eficaz:
            </h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                  <p className="font-medium text-green-800 mb-2">✅ Recomendado:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Mensagem de boas-vindas calorosa</li>
                    <li>• Próximos passos após aceitar o convite</li>
                    <li>• Informações sobre a comunidade/plataforma</li>
                    <li>• Contato para dúvidas</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                  <p className="font-medium text-red-800 mb-2">❌ Evite:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Informações confidenciais ou sensíveis</li>
                    <li>• Textos muito longos ou complexos</li>
                    <li>• Links externos não verificados</li>
                    <li>• Linguagem muito técnica</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
