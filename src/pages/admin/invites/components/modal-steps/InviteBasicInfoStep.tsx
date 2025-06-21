
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Shield } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { useRoles } from '@/hooks/admin/useRoles';

interface InviteBasicInfoStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteBasicInfoStep = ({ formData, onUpdate }: InviteBasicInfoStepProps) => {
  const { roles, loading } = useRoles();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
        <p className="text-sm text-gray-600 mt-1">
          Preencha os dados essenciais para o convite
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-viverblue" />
              Dados da Pessoa
            </CardTitle>
            <CardDescription>
              Informações básicas do convidado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
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
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium">
                Nome da Pessoa
              </Label>
              <Input
                id="userName"
                placeholder="Nome completo (opcional)"
                value={formData.userName || ''}
                onChange={(e) => onUpdate({ userName: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Usado para personalizar as mensagens
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Acesso */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-viverblue" />
              Acesso e Permissões
            </CardTitle>
            <CardDescription>
              Defina o nível de acesso do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Função/Role *
              </Label>
              <Select
                value={formData.roleId || ''}
                onValueChange={(value) => onUpdate({ roleId: value })}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>
                      Carregando...
                    </SelectItem>
                  ) : (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            role.name === 'admin' ? 'bg-red-500' :
                            role.name === 'moderator' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Dicas importantes:
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• O email é obrigatório e será usado para login</li>
                <li>• O nome ajuda a personalizar as comunicações</li>
                <li>• A função define as permissões do usuário na plataforma</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
