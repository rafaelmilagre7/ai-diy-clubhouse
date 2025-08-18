import { useState, useCallback } from 'react';

interface PremiumUpgradeModalState {
  open: boolean;
  feature: 'solutions' | 'learning' | 'tools' | 'benefits' | 'networking' | 'events';
  itemTitle?: string;
}

export const usePremiumUpgradeModal = () => {
  const [modalState, setModalState] = useState<PremiumUpgradeModalState>({
    open: false,
    feature: 'solutions'
  });

  const showUpgradeModal = useCallback((
    feature: PremiumUpgradeModalState['feature'], 
    itemTitle?: string
  ) => {
    setModalState({
      open: true,
      feature,
      itemTitle
    });
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, open: false }));
  }, []);

  return {
    modalState,
    showUpgradeModal,
    hideUpgradeModal
  };
};