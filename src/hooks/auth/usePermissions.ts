
import { useAuth } from '@/contexts/auth';
import { useMemo } from 'react';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface PermissionsHookReturn {
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  userPermissions: string[];
  permissions: Permission[]; // Adicionado para compatibilidade
  roles: Role[]; // Adicionado para compatibilidade
}

// Mock data para permissões e roles - mantém a funcionalidade básica
const mockPermissions: Permission[] = [
  {
    id: '1',
    code: 'admin.all',
    name: 'Administração Completa',
    description: 'Acesso total ao sistema',
    category: 'admin'
  },
  {
    id: '2',
    code: 'solutions.view',
    name: 'Visualizar Soluções',
    description: 'Pode visualizar soluções',
    category: 'solutions'
  },
  {
    id: '3',
    code: 'solutions.create',
    name: 'Criar Soluções',
    description: 'Pode criar novas soluções',
    category: 'solutions'
  },
  {
    id: '4',
    code: 'solutions.edit',
    name: 'Editar Soluções',
    description: 'Pode editar soluções existentes',
    category: 'solutions'
  },
  {
    id: '5',
    code: 'users.view',
    name: 'Visualizar Usuários',
    description: 'Pode visualizar usuários',
    category: 'users'
  },
  {
    id: '6',
    code: 'courses.view',
    name: 'Visualizar Cursos',
    description: 'Pode visualizar cursos',
    category: 'courses'
  }
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acesso total ao sistema'
  },
  {
    id: '2',
    name: 'Formação',
    description: 'Acesso aos recursos de formação'
  },
  {
    id: '3',
    name: 'Membro',
    description: 'Usuário padrão do sistema'
  }
];

export const usePermissions = (): PermissionsHookReturn => {
  const { user, profile, isAdmin, isLoading } = useAuth();

  const userPermissions = useMemo(() => {
    const permissions: string[] = [];
    
    // Se é admin, tem todas as permissões
    if (isAdmin || profile?.role === 'admin') {
      permissions.push(
        'admin.all',
        'solutions.view',
        'solutions.create', 
        'solutions.edit',
        'solutions.delete',
        'users.view',
        'users.edit',
        'courses.view',
        'courses.create',
        'courses.edit'
      );
    }
    
    // Se é formação, tem permissões específicas
    if (profile?.role === 'formacao') {
      permissions.push(
        'solutions.view',
        'courses.view',
        'courses.create',
        'courses.edit'
      );
    }
    
    // Todos os usuários autenticados têm permissões básicas
    if (user) {
      permissions.push('solutions.view', 'profile.edit');
    }
    
    return permissions;
  }, [user, profile, isAdmin]);

  const hasPermission = (permission: string): boolean => {
    // Verificação rápida para admin
    if (isAdmin || profile?.role === 'admin') {
      return true;
    }
    
    // Verificação específica de permissão
    return userPermissions.includes(permission);
  };

  return {
    hasPermission,
    loading: isLoading,
    userPermissions,
    permissions: mockPermissions,
    roles: mockRoles
  };
};
