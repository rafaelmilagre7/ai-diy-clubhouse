
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Shield, AlertCircle } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { useRoles } from '@/hooks/admin/useRoles';

interface InviteBasicInfoStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteBasicInfoStep = ({ formData, onUpdate }: InviteBasicInfoStepProps) => {
  const { roles, loading } = useRoles();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Informações Básicas</h3>
        <p className="text-gray-600">
          Preencha os dados essenciais para criar o convite
        </p>
      </div>

      {/* Main Form */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Dados Pessoais */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              Dados da Pessoa
            </CardTitle>
            <CardDescription className="text-gray-600">
              Informações básicas do convidado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email || ''}
                  onChange={(e) => onUpdate({ email: e.target.value })}
                  className="pl-10 border-gray-200 focus:border-[#0ABAB5] focus:ring-[#0ABAB5]/20 bg-white text-gray-900"
                  required
                />
              </div>
              {!formData.email && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Este campo é obrigatório
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium text-gray-900">
                Nome da Pessoa
              </Label>
              <Input
                id="userName"
                placeholder="Nome completo (opcional)"
                value={formData.userName || ''}
                onChange={(e) => onUpdate({ userName: e.target.value })}
                className="border-gray-200 focus:border-[#0ABAB5] focus:ring-[#0ABAB5]/20 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500">
                Usado para personalizar as mensagens do convite
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Acesso */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              Acesso e Permissões
            </CardTitle>
            <CardDescription className="text-gray-600">
              Defina o nível de acesso do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-900">
                Função/Role *
              </Label>
              {loading ? (
                <div className="h-10 w-full border border-gray-200 bg-gray-50 rounded-md flex items-center px-3 text-gray-500 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0ABAB5] mr-2"></div>
                  Carregando funções...
                </div>
              ) : (
                <Select
                  value={formData.roleId || ''}
                  onValueChange={(value) => onUpdate({ roleId: value })}
                  required
                >
                  <SelectTrigger id="role" className="border-gray-200 focus:border-[#0ABAB5] focus:ring-[#0ABAB5]/20 bg-white text-gray-900">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-gray-900 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            role.name === 'admin' ? 'bg-red-500' :
                            role.name === 'moderator' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="capitalize">{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!formData.roleId && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Selecione uma função para o usuário
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-900">
                💡 Dicas importantes:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span>O email é obrigatório e será usado para login</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span>O nome ajuda a personalizar as comunicações</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span>A função define as permissões na plataforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Verifique se o email está correto antes de prosseguir</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
