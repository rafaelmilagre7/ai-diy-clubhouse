import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface PremiumUpgradeModalState {
  open: boolean;
  feature: 'solutions' | 'learning' | 'tools' | 'benefits' | 'networking' | 'events';
  itemTitle?: string;
}

type PremiumUpgradeModalContextType = {
  modalState: PremiumUpgradeModalState;
  showUpgradeModal: (
    feature: PremiumUpgradeModalState['feature'],
    itemTitle?: string
  ) => void;
  hideUpgradeModal: () => void;
};

const PremiumUpgradeModalContext = createContext<PremiumUpgradeModalContextType | null>(null);

export const PremiumUpgradeModalProvider = ({ children }: { children: ReactNode }) => {
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

  return (
    <PremiumUpgradeModalContext.Provider value={{ modalState, showUpgradeModal, hideUpgradeModal }}>
      {children}
    </PremiumUpgradeModalContext.Provider>
  );
};

export const usePremiumUpgradeModal = () => {
  const ctx = useContext(PremiumUpgradeModalContext);
  if (ctx) return ctx;

  // Fallback local state quando não estiver dentro do Provider
  const [modalState, setModalState] = useState<PremiumUpgradeModalState>({
    open: false,
    feature: 'solutions'
  });

  const showUpgradeModal = useCallback((
    feature: PremiumUpgradeModalState['feature'], 
    itemTitle?: string
  ) => {
    setModalState({ open: true, feature, itemTitle });
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