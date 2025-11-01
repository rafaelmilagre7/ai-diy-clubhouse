/**
 * Design tokens unificados para o sistema de networking
 * Mantém consistência visual em toda a plataforma
 */

export const connectionTokens = {
  spacing: {
    cardPadding: 'p-4',
    cardGap: 'gap-3',
    gridGap: 'gap-6',
    contentSpace: 'space-y-3',
  },
  colors: {
    cardBorder: 'border-aurora/20 hover:border-aurora/40',
    cardBg: 'aurora-glass',
    badgeConnected: 'bg-aurora-primary/20 text-aurora-primary border-aurora-primary/40',
    badgePending: 'bg-operational/30 text-operational-foreground border-operational/50',
    badgeOnline: 'bg-system-healthy',
    badgeOffline: 'bg-muted',
  },
  sizes: {
    avatarMd: 'w-12 h-12',
    avatarSm: 'w-10 h-10',
    iconSm: 'w-4 h-4',
    iconMd: 'w-5 h-5',
  },
  transitions: {
    default: 'transition-all duration-300',
    fast: 'transition-all duration-150',
  },
} as const;
