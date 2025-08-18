/**
 * Utilidades para sincronização em tempo real de permissões de roles
 * Garante que mudanças feitas no admin sejam refletidas instantaneamente
 */

// Simular invalidação global de cache para todos os usuários conectados
// Utiliza localStorage para sinalizar que as permissões foram alteradas
export const triggerGlobalPermissionSync = (roleName: string) => {
  const syncEvent = {
    type: 'ROLE_PERMISSIONS_UPDATED',
    roleAffected: roleName,
    timestamp: Date.now(),
    id: Math.random().toString(36).substring(7)
  };
  
  // Armazenar evento no localStorage para que outros tabs detectem
  localStorage.setItem('lastPermissionSync', JSON.stringify(syncEvent));
  
  // Dispatar evento customizado para componentes que estão escutando
  window.dispatchEvent(new CustomEvent('rolePermissionsUpdated', { 
    detail: syncEvent 
  }));
  
  console.log('🌐 [ROLE-SYNC] Evento de sincronização global disparado:', syncEvent);
};

// Hook para detectar mudanças de permissões em tempo real
export const useGlobalPermissionListener = (callback: (event: any) => void) => {
  // Escutar mudanças no localStorage (para outros tabs)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'lastPermissionSync' && e.newValue) {
      try {
        const syncEvent = JSON.parse(e.newValue);
        callback(syncEvent);
      } catch (error) {
        console.error('Erro ao processar evento de sincronização:', error);
      }
    }
  };
  
  // Escutar eventos customizados (para o mesmo tab)
  const handleCustomEvent = (e: CustomEvent) => {
    callback(e.detail);
  };
  
  // Configurar listeners
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('rolePermissionsUpdated', handleCustomEvent);
  
  // Cleanup
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('rolePermissionsUpdated', handleCustomEvent);
  };
};