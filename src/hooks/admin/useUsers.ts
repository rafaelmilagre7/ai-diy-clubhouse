
import { useState, useEffect, useCallback } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [saving, setSaving] = useState(false);

  // Função robusta para limpar overlays persistentes
  const cleanupOverlays = useCallback(() => {
    console.log('Executando limpeza de overlays no hook useUsers');
    
    // Remove portais Radix
    const overlays = document.querySelectorAll('[data-radix-portal]');
    console.log(`Encontrados ${overlays.length} portais Radix`);
    overlays.forEach(el => {
      if (el && el.parentNode) {
        console.log('Removendo portal Radix');
        el.parentNode.removeChild(el);
      }
    });
    
    // Remove backdrops Radix
    const radixBackdrops = document.querySelectorAll("[data-state='open'].bg-black");
    console.log(`Encontrados ${radixBackdrops.length} backdrops Radix`);
    radixBackdrops.forEach(el => {
      if (el && el.parentNode) {
        console.log('Removendo backdrop Radix');
        el.parentNode.removeChild(el);
      }
    });
    
    // Remove backdrops MUI (abordagem direta)
    const muiBackdrops = document.querySelectorAll('.MuiBackdrop-root');
    console.log(`Encontrados ${muiBackdrops.length} backdrops MUI`);
    muiBackdrops.forEach(el => {
      console.log('Removendo backdrop MUI diretamente');
      el.remove();
    });
    
    // Limpa portais MUI
    const muiPortals = document.querySelectorAll('#mui-modal-root > div');
    console.log(`Encontrados ${muiPortals.length} portais MUI`);
    muiPortals.forEach(el => {
      console.log('Removendo portal MUI');
      el.remove();
    });
    
    // Restaura scroll se necessário
    if (document.body.style.overflow === 'hidden') {
      console.log('Restaurando overflow do body');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    // Logs finais para confirmar remoção
    console.log('Backdrop removido:', document.querySelectorAll('.MuiBackdrop-root').length);
    console.log('Portals Radix restantes:', document.querySelectorAll('[data-radix-portal]').length);
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
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      setEditRoleOpen(false);
      // Mesmo se não houver alteração, garantir limpeza de overlays
      setTimeout(cleanupOverlays, 100);
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
      
      toast({
        title: "Função atualizada",
        description: `A função do usuário ${selectedUser.name || selectedUser.email} foi atualizada para ${newRole === "admin" ? "Administrador" : "Membro"}.`,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar função:", error.message);
      toast({
        title: "Erro ao atualizar função",
        description: error.message || "Não foi possível atualizar a função do usuário.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      // Fechar modal e executar limpeza completa com timeouts encadeados
      setTimeout(() => {
        setEditRoleOpen(false);
        // Esperar animação de fechamento completar
        setTimeout(() => {
          console.log("Executando limpeza final após salvar/fechar");
          cleanupOverlays();
          // Verificação adicional após um tempo
          setTimeout(() => {
            const remainingBackdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black');
            if (remainingBackdrops.length > 0) {
              console.log(`Ainda existem ${remainingBackdrops.length} backdrops. Fazendo limpeza forçada.`);
              remainingBackdrops.forEach(el => el.remove());
            }
          }, 500);
        }, 200);
      }, 100);
    }
  };

  // Garantir limpeza quando o componente for desmontado
  useEffect(() => {
    return () => {
      console.log('Hook useUsers desmontado, executando limpeza final');
      cleanupOverlays();
    };
  }, [cleanupOverlays]);

  // Monitorar estado do modal e garantir limpeza quando fechado
  useEffect(() => {
    if (!editRoleOpen) {
      console.log('Modal detectado como fechado no hook, executando limpeza');
      // Pequeno delay para permitir que animações terminem
      setTimeout(cleanupOverlays, 200);
    }
  }, [editRoleOpen, cleanupOverlays]);

  // Efeito para carregar usuários inicialmente
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
    cleanupOverlays, // Exportamos a função para uso externo
  };
};
