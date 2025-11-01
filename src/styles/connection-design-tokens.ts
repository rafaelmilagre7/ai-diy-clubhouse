/**
 * Design tokens unificados para todo o sistema de networking
 * Mantém consistência visual e facilita manutenção
 */

export const connectionDesignTokens = {
  // === CARDS ===
  card: {
    padding: 'p-6',
    gap: 'gap-4',
    border: 'border border-aurora/20 hover:border-aurora/40',
    bg: 'bg-surface-elevated/50 backdrop-blur-sm',
    shadow: 'shadow-sm hover:shadow-lg',
    radius: 'rounded-2xl',
    transition: 'transition-all duration-300',
  },
  
  // === BADGES ===
  badge: {
    connected: 'bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/40',
    pending: 'bg-operational/20 text-operational border border-operational/40 animate-pulse',
    sent: 'bg-muted/40 text-muted-foreground border border-border/40',
    new: 'bg-aurora/20 text-aurora border border-aurora/40 animate-pulse',
    success: 'bg-system-healthy/20 text-system-healthy border border-system-healthy/40',
    warning: 'bg-operational/20 text-operational border border-operational/40',
    danger: 'bg-destructive/20 text-destructive border border-destructive/40',
  },
  
  // === BUTTONS ===
  button: {
    primary: 'bg-gradient-to-r from-aurora to-aurora-primary hover:from-aurora/90 hover:to-aurora-primary/90 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all border-0',
    secondary: 'border-aurora/30 hover:bg-aurora/10 hover:border-aurora/40 hover:text-aurora transition-all',
    danger: 'border-destructive/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60 transition-all',
    success: 'bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/40 hover:bg-aurora-primary/30 transition-all',
  },
  
  // === HEADERS ===
  header: {
    gradient: 'bg-gradient-to-br from-aurora/10 via-surface-elevated to-operational/5',
    border: 'border border-aurora/20',
    padding: 'p-8',
    radius: 'rounded-2xl',
    shadow: 'shadow-md',
  },
  
  // === STATS CARDS ===
  stats: {
    variants: {
      primary: 'bg-aurora/10 border-aurora/30 text-aurora',
      success: 'bg-system-healthy/10 border-system-healthy/30 text-system-healthy',
      warning: 'bg-operational/10 border-operational/30 text-operational',
      info: 'bg-aurora-primary/10 border-aurora-primary/30 text-aurora-primary',
    },
  },
  
  // === TABS ===
  tabs: {
    list: 'inline-flex items-center gap-1.5 rounded-xl bg-surface-elevated/50 backdrop-blur-md border border-border/40 p-1.5 shadow-lg',
    trigger: 'relative px-6 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground hover:bg-muted/50',
    indicator: 'absolute inset-y-1 inset-x-1 rounded-lg bg-gradient-to-r from-aurora via-aurora-primary to-operational shadow-md',
    subList: 'inline-flex items-center gap-1 rounded-lg bg-muted/30 p-1',
    subTrigger: 'relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm',
  },
  
  // === ANIMATIONS ===
  animations: {
    fadeIn: 'animate-fade-in',
    scaleIn: 'animate-scale-in',
    slideIn: 'animate-slide-in-right',
    pulse: 'animate-pulse',
    hover: 'hover:scale-105 transition-transform duration-200',
    tap: 'active:scale-95',
  },
  
  // === STATUS ===
  status: {
    temporal: {
      recent: 'bg-system-healthy/20 text-system-healthy border border-system-healthy/40', // 0-24h
      waiting: 'bg-operational/20 text-operational border border-operational/40', // 1-7d
      overdue: 'bg-destructive/20 text-destructive border border-destructive/40', // 7d+
    },
  },
} as const;
