
import { useState, useEffect, useCallback } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [saving, setSaving] = useState(false);

  // Função otimizada para limpar overlays persistentes
  const cleanupOverlays = useCallback(() => {
    console.log('Executando limpeza de overlays');
    
    // Restaurar interatividade do body
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.pointerEvents = '';
    document.body.removeAttribute('aria-hidden');
    
    // Remover backdrops do Radix UI
    const radixBackdrops = document.querySelectorAll("[data-state='open'].bg-black");
    if (radixBackdrops.length > 0) {
      console.log(`Removendo ${radixBackdrops.length} backdrops Radix`);
      radixBackdrops.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
    
    // Remover portais Radix
    const radixPortals = document.querySelectorAll('[data-radix-portal]');
    if (radixPortals.length > 0) {
      console.log(`Removendo ${radixPortals.length} portais Radix`);
      radixPortals.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
    
    // Remover backdrops MUI
    const muiBackdrops = document.querySelectorAll('.MuiBackdrop-root');
    if (muiBackdrops.length > 0) {
      console.log(`Removendo ${muiBackdrops.length} backdrops MUI`);
      muiBackdrops.forEach(el => el.remove());
    }
    
    // Remover portais MUI
    const muiPortals = document.querySelectorAll('#mui-modal-root > div');
    if (muiPortals.length > 0) {
      console.log(`Removendo ${muiPortals.length} portais MUI`);
      muiPortals.forEach(el => el.remove());
    }
    
    // Remover qualquer backdrop genérico
    const genericBackdrops = document.querySelectorAll('.backdrop, [role="presentation"]');
    if (genericBackdrops.length > 0) {
      console.log(`Removendo ${genericBackdrops.length} backdrops genéricos`);
      genericBackdrops.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
    
    // Log final de confirmação
    console.log('Backdrop removido:', document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black').length);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error.message);
      toast.error("Erro ao carregar usuários", {
        description: "Não foi possível carregar a lista de usuários."
      });
    } finally {
      setLoading(false);
    }
  };

  // Função otimizada para atualizar função do usuário
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      // Fechar modal e limpar overlays
      setEditRoleOpen(false);
      cleanupOverlays();
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      // Atualiza a lista de usuários com o novo papel
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
      
      // CRUCIAL: Primeiro fechamos o modal
      setEditRoleOpen(false);
      
      // Limpamos TODOS os overlays ANTES de exibir o toast
      cleanupOverlays();
      
      // Pequeno delay para garantir que a animação do modal concluiu
      setTimeout(() => {
        // Segunda limpeza para garantir que não sobraram elementos
        cleanupOverlays();
        
        // Só exibimos o toast DEPOIS da limpeza completa
        setTimeout(() => {
          toast.success("Função atualizada", {
            description: `A função do usuário ${selectedUser.name || selectedUser.email} foi atualizada para ${newRole === "admin" ? "Administrador" : "Membro"}.`,
            duration: 3000,
          });
        }, 100);
      }, 100);
      
    } catch (error: any) {
      console.error("Erro ao atualizar função:", error.message);
      
      // Fechar modal e limpar tudo antes de mostrar erro
      setEditRoleOpen(false);
      cleanupOverlays();
      
      setTimeout(() => {
        toast.error("Erro ao atualizar função", {
          description: error.message || "Não foi possível atualizar a função do usuário."
        });
      }, 100);
    } finally {
      setSaving(false);
      
      // Verificação final (fallback automático)
      setTimeout(() => {
        if (document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black, .backdrop').length > 0) {
          console.log(`Fallback acionado: Limpeza forçada de overlays remanescentes`);
          cleanupOverlays();
        }
      }, 2000);
    }
  };

  // Efeito para garantir limpeza quando o componente é desmontado
  useEffect(() => {
    return () => {
      cleanupOverlays();
    };
  }, [cleanupOverlays]);

  // Efeito para monitorar mudanças no estado do modal
  useEffect(() => {
    if (!editRoleOpen) {
      // Quando o modal fecha, limpamos os overlays
      cleanupOverlays();
    }
  }, [editRoleOpen, cleanupOverlays]);

  // Efeito para buscar usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    selectedUser,
    setSelectedUser,
    editRoleOpen,
    setEditRoleOpen,
    newRole,
    setNewRole,
    saving,
    handleUpdateRole,
    cleanupOverlays,
  };
};
