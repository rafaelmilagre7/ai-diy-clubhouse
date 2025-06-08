
export const theme = {
  colors: {
    // === Cores Primárias ===
    primary: "#00EAD9", // Azul claro principal
    primaryLight: "#6DF2E9", // Tom mais claro
    primaryDark: "#00BAB0", // Tom mais escuro
    primaryHover: "#00D6C7", // Tom para hover
    primaryActive: "#00A69D", // Tom para active
    primaryTransparent10: "rgba(0, 234, 217, 0.1)",
    primaryTransparent20: "rgba(0, 234, 217, 0.2)",
    
    // === Cores Secundárias ===
    secondary: "#FEC260", // Dourado complementar
    secondaryLight: "#ffdf99",
    secondaryDark: "#e0a23f",
    secondaryHover: "#fed57c",
    
    // === Cores de Destaque ===
    accent: "#9b87f5", // Roxo complementar
    accentLight: "#b8a9fa",
    accentDark: "#7b69cc",
    accentHover: "#a594f7",
    
    // === Cores de Status ===
    success: "#10b981", // Verde moderno
    successLight: "#34d399",
    successDark: "#059669",
    
    error: "#ef4444", // Vermelho moderno
    errorLight: "#f87171", 
    errorDark: "#dc2626",
    
    warning: "#f59e0b", // Laranja moderno
    warningLight: "#fbbf24",
    warningDark: "#d97706",
    
    info: "#3b82f6", // Azul informativo
    infoLight: "#60a5fa",
    infoDark: "#2563eb",
    
    // === Hierarquia de Texto ===
    textPrimary: "#F8FAFC", // Texto principal - alta legibilidade
    textSecondary: "#E2E8F0", // Texto secundário
    textTertiary: "#94A3B8", // Texto terciário
    textMuted: "#64748B", // Texto esmaecido
    textDisabled: "#475569", // Texto desabilitado
    
    // === Sistema de Fundo ===
    background: "#0F111A", // Fundo principal escuro
    backgroundLight: "#1A1E2E", // Fundo alternativo
    backgroundElevated: "#212936", // Fundo elevado
    
    // === Superfícies ===
    surface: "#151823", // Superfície base
    surfaceElevated: "#1E2432", // Superfície elevada
    surfaceHover: "#252B3A", // Superfície em hover
    surfaceActive: "#2A3441", // Superfície ativa
    surfaceSelected: "#1A2B3D", // Superfície selecionada
    
    // === Sistema de Bordas ===
    border: "#334155", // Borda padrão
    borderLight: "#475569", // Borda clara
    borderSubtle: "#1E293B", // Borda sutil
    borderStrong: "#64748B", // Borda forte
    borderAccent: "#00EAD9", // Borda com destaque
    
    // === Overlays e Efeitos ===
    overlay: "rgba(15, 17, 26, 0.8)", // Overlay escuro
    overlayLight: "rgba(15, 17, 26, 0.6)", // Overlay mais claro
    backdrop: "rgba(15, 17, 26, 0.9)", // Backdrop para modais
    
    // === Gradientes ===
    gradientPrimary: "linear-gradient(135deg, #00EAD9, #9b87f5)",
    gradientSecondary: "linear-gradient(135deg, #FEC260, #00EAD9)",
    gradientSurface: "linear-gradient(135deg, #151823, #1E2432)",
    gradientText: "linear-gradient(135deg, #00EAD9, #FEC260)",
  },
  
  // === Sistema de Espaçamento ===
  spacing: {
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    xxl: "3rem",      // 48px
    xxxl: "4rem",     // 64px
  },
  
  // === Sistema de Raio de Borda ===
  borderRadius: {
    none: "0",
    xs: "0.125rem",   // 2px
    sm: "0.25rem",    // 4px
    md: "0.5rem",     // 8px
    lg: "0.75rem",    // 12px
    xl: "1rem",       // 16px
    xxl: "1.5rem",    // 24px
    full: "9999px",
  },
  
  // === Sistema de Animação ===
  animation: {
    instant: "50ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },
  
  // === Sistema de Sombras ===
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.05)",
    sm: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
    lg: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
    xl: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
    xxl: "0 25px 50px rgba(0,0,0,0.25)",
    inner: "inset 0 2px 4px rgba(0,0,0,0.06)",
    glow: "0 0 20px rgba(0, 234, 217, 0.3)",
    glowStrong: "0 0 40px rgba(0, 234, 217, 0.4)",
  },
  
  // === Sistema de Tipografia ===
  typography: {
    fontSizes: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem",    // 48px
      "6xl": "3.75rem", // 60px
      "7xl": "4.5rem",  // 72px
    },
    fontWeights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    }
  },
  
  // === Breakpoints Responsivos ===
  breakpoints: {
    sm: "640px",
    md: "768px", 
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  
  // === Z-Index System ===
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  }
};

// Tipos TypeScript para o tema
export type ThemeColors = keyof typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;
export type ThemeBorderRadius = keyof typeof theme.borderRadius;
export type ThemeAnimation = keyof typeof theme.animation;
export type ThemeShadows = keyof typeof theme.shadows;
export type ThemeFontSizes = keyof typeof theme.typography.fontSizes;
export type ThemeFontWeights = keyof typeof theme.typography.fontWeights;
export type ThemeBreakpoints = keyof typeof theme.breakpoints;
export type ThemeZIndex = keyof typeof theme.zIndex;
