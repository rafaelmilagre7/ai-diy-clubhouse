
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

  // Função robusta para limpar overlays persistentes
  const cleanupOverlays = useCallback(() => {
    console.log('Executando limpeza de overlays no hook useUsers');
    
    // Primeiro, restaurar os estilos do body que podem estar bloqueando interações
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.pointerEvents = '';
    document.body.removeAttribute('aria-hidden');
    
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
    
    // Limpa toasts do Radix UI que podem estar travando a tela
    const radixToasts = document.querySelectorAll('[role="status"]');
    console.log(`Encontrados ${radixToasts.length} toasts Radix`);
    radixToasts.forEach(el => {
      console.log('Removendo toast Radix');
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // Limpa qualquer portal de toast
    const toastPortals = document.querySelectorAll('[id*="toast"]');
    console.log(`Encontrados ${toastPortals.length} portais de toast`);
    toastPortals.forEach(el => {
      console.log('Removendo portal de toast');
      if (el.parentNode && !el.id.includes("sonner")) {
        el.parentNode.removeChild(el);
      }
    });
    
    // Logs finais para confirmar remoção
    console.log('Backdrop removido:', document.querySelectorAll('.MuiBackdrop-root').length);
    console.log('Portals Radix restantes:', document.querySelectorAll('[data-radix-portal]').length);
    console.log('Toasts restantes:', document.querySelectorAll('[role="status"]').length);
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

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      // Fechar modal sem atualizar, mas garantir limpeza
      setEditRoleOpen(false);
      
      // Limpar imediatamente qualquer backdrop ou overlay
      cleanupOverlays();
      
      // Verificação adicional após um tempo
      setTimeout(() => {
        cleanupOverlays();
      }, 500);
      
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
      
      // IMPORTANTE: Primeiro fechamos o modal e limpamos qualquer backdrop
      setEditRoleOpen(false);
      
      // Executamos limpeza imediata
      cleanupOverlays();
      
      // Verificação adicional após pequeno delay para garantir que animações foram concluídas
      setTimeout(() => {
        cleanupOverlays();
        
        // Somente após garantir que backdrops foram removidos, exibir o toast
        setTimeout(() => {
          // Usar toast do Sonner sem bloqueio de interação
          toast.success("Função atualizada", {
            description: `A função do usuário ${selectedUser.name || selectedUser.email} foi atualizada para ${newRole === "admin" ? "Administrador" : "Membro"}.`,
            position: "bottom-right",
            duration: 3000,
          });
          
          // Verificação final para garantir que não há overlays bloqueando
          setTimeout(cleanupOverlays, 300);
        }, 200);
      }, 100);
      
    } catch (error: any) {
      console.error("Erro ao atualizar função:", error.message);
      
      // Primeiro limpamos overlays
      cleanupOverlays();
      
      // Depois exibimos o toast de erro
      setTimeout(() => {
        toast.error("Erro ao atualizar função", {
          description: error.message || "Não foi possível atualizar a função do usuário."
        });
      }, 200);
    } finally {
      setSaving(false);
      
      // Garantir que modal está fechado
      setEditRoleOpen(false);
      
      // Forçar uma verificação final após 2 segundos (fallback automático)
      setTimeout(() => {
        const remainingBackdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black');
        if (remainingBackdrops.length > 0) {
          console.log(`FALLBACK: Ainda existem ${remainingBackdrops.length} backdrops após 2s. Remoção forçada.`);
          remainingBackdrops.forEach(el => el.remove());
          
          // Forçar restauração da interatividade da página
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.body.removeAttribute('aria-hidden');
        }
        
        console.log('Estado final do body após fallback:', {
          overflow: document.body.style.overflow,
          pointerEvents: document.body.style.pointerEvents,
          ariaHidden: document.body.getAttribute('aria-hidden'),
          paddingRight: document.body.style.paddingRight
        });
      }, 2000);
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
      // Limpeza imediata
      cleanupOverlays();
      
      // Verificação adicional após animações
      setTimeout(cleanupOverlays, 300);
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
    cleanupOverlays,
  };
};
