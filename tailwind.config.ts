
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // === SPACING SYSTEM (8px base) ===
      spacing: {
        'xs': '0.25rem',  // 4px
        'sm': '0.5rem',   // 8px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
      },
      
      // === TYPOGRAPHY SCALE ===
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      
      // === TRANSITION SYSTEM ===
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
        slowest: '1000ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // === CHART DIMENSIONS ===
      height: {
        'chart-sm': '200px',
        'chart-md': '300px',
        'chart-lg': '400px',
        'chart-xl': '500px',
        'scroll-sm': '220px',
        'scroll-md': '320px',
        'scroll-lg': '420px',
        'scroll-xl': '520px',
        'scroll-full': 'calc(100vh - 12rem)',
        'nps-chart': '250px',
        'badge-h': '20px',
        'skeleton-h': '80px',
        'skeleton-h-lg': '160px',
        'certificate': '900px',
        'viewport-85': '85vh',
        'viewport-full': '100vh',
        'viewport-calc': 'calc(100vh - 120px)',
        'calendar': '700px',
        'event-row': '100px',
        'solution-card': '200px',
        'hero-viewport': '70vh',
        'blur-circle': '600px',
        'benefit-card': '280px',
        'blob-sm': '200px',
        'blob-md': '350px',
        'blob-lg': '500px',
        'separator': '1px',
      },
      
      width: {
        'select-sm': '140px',
        'select-md': '160px',
        'select-lg': '180px',
        'select-xl': '220px',
        'table-sm': '200px',
        'table-md': '300px',
        'table-col-30': '30%',
        'badge-sm': '20px',
        'skeleton-sm': '100px',
        'skeleton-md': '150px',
        'skeleton-lg': '200px',
        'skeleton-xl': '300px',
        'button-min': '120px',
        'tabs': '400px',
        'dialog-form': '400px',
        'certificate': '1200px',
        'sidebar-collapsed': '70px',
        'card-sidebar': '280px',
        'select': '200px',
        'blur-circle': '600px',
        'blob-sm': '200px',
        'blob-md': '350px',
        'blob-lg': '500px',
        'drawer-handle': '100px',
        'separator': '1px',
      },
      
      minHeight: {
        'chart-sm': '200px',
        'chart-md': '300px',
        'chart-lg': '400px',
        'chart-xl': '500px',
        'error-state': '50vh',
        'feature-block': '400px',
        'content-min': '200px',
        'tab-button': '70px',
        'hero': '500px',
        'content': '600px',
        'swipe': '720px',
        'access-denied': '60vh',
        'showcase': '120px',
        'transition': '100px',
        'section': '70vh',
        'textarea': '40px',
      },
      
      maxHeight: {
        'chart-sm': '200px',
        'chart-md': '300px',
        'chart-lg': '400px',
        'chart-xl': '500px',
        'modal-sm': '60vh',
        'modal-md': '80vh',
        'modal-lg': '90vh',
        'modal-xl': '95vh',
        'editor': 'calc(80vh - 140px)',
        'editor-full': 'calc(100vh - 120px)',
        'image-preview': '150px',
        'textarea': '120px',
        'modal': '90vh',
      },
      
      minWidth: {
        'button': '120px',
        'badge': '20px',
        'timestamp': '60px',
        'mobile': '320px',
        'filter': '300px',
        'card': '280px',
        'stat': '72px',
        'profile-button': '140px',
      },
      
      maxWidth: {
        'table-sm': '200px',
        'table-md': '300px',
        'dialog-sm': '28rem',
        'dialog-md': '32rem',
        'dialog-lg': '40rem',
        'dialog-xl': '48rem',
        'step-label': '120px',
        'logo-sm': '160px',
        'logo': '200px',
        'tag': '150px',
        'toast': '420px',
        'dialog-form-sm': '425px',
        'dialog-form': '500px',
        'dialog-form-lg': '600px',
      },
      
      flexBasis: {
        'lesson-card': '280px',
        'lesson-card-sm': '280px',
        'lesson-card-md': '300px',
        'lesson-card-lg': '320px',
      },
      
      // === BLUR & BACKDROP ===
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Superfícies com sistema de elevação
        surface: {
          base: "hsl(var(--surface-base))",
          elevated: "hsl(var(--surface-elevated))",
          overlay: "hsl(var(--surface-overlay))",
          modal: "hsl(var(--surface-modal))",
        },
        
        // Hierarquia de texto
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          disabled: "hsl(var(--text-disabled))",
        },
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Design system colors
        viverblue: {
          DEFAULT: "hsl(var(--viverblue))",
          light: "hsl(var(--viverblue-light))",
          lighter: "hsl(var(--viverblue-lighter))",
          dark: "hsl(var(--viverblue-dark))",
          darker: "hsl(var(--viverblue-darker))",
        },
        
        // Aurora aliases (mapping to viverblue)
        aurora: {
          DEFAULT: "hsl(var(--viverblue))",
          light: "hsl(var(--viverblue-light))",
          lighter: "hsl(var(--viverblue-lighter))",
          dark: "hsl(var(--viverblue-dark))",
          darker: "hsl(var(--viverblue-darker))",
        },
        
        // Aurora Primary - cor principal da marca (#0ABAB5)
        'aurora-primary': {
          DEFAULT: "hsl(var(--aurora-primary))",
          light: "hsl(var(--aurora-primary-light))",
          dark: "hsl(var(--aurora-primary-dark))",
        },
        
        // Track colors
        revenue: {
          DEFAULT: "hsl(var(--revenue))",
          light: "hsl(var(--revenue-light))",
          lighter: "hsl(var(--revenue-lighter))",
          dark: "hsl(var(--revenue-dark))",
          darker: "hsl(var(--revenue-darker))",
        },
        operational: {
          DEFAULT: "hsl(var(--operational))",
          light: "hsl(var(--operational-light))",
          lighter: "hsl(var(--operational-lighter))",
          dark: "hsl(var(--operational-dark))",
          darker: "hsl(var(--operational-darker))",
        },
        strategy: {
          DEFAULT: "hsl(var(--strategy))",
          light: "hsl(var(--strategy-light))",
          lighter: "hsl(var(--strategy-lighter))",
          dark: "hsl(var(--strategy-dark))",
          darker: "hsl(var(--strategy-darker))",
        },
        
        // Priority colors
        vivercyan: {
          DEFAULT: "hsl(var(--vivercyan))",
          light: "hsl(var(--vivercyan-light))",
          lighter: "hsl(var(--vivercyan-lighter))",
          dark: "hsl(var(--vivercyan-dark))",
          darker: "hsl(var(--vivercyan-darker))",
        },
        viverpetrol: {
          DEFAULT: "hsl(var(--viverpetrol))",
          light: "hsl(var(--viverpetrol-light))",
          lighter: "hsl(var(--viverpetrol-lighter))",
          dark: "hsl(var(--viverpetrol-dark))",
          darker: "hsl(var(--viverpetrol-darker))",
        },
        
        // Social brand colors
        'social-whatsapp': {
          DEFAULT: "hsl(var(--social-whatsapp))",
          hover: "hsl(var(--social-whatsapp-hover))",
        },
        'social-linkedin': {
          DEFAULT: "hsl(var(--social-linkedin))",
          hover: "hsl(var(--social-linkedin-hover))",
          alt: "hsl(var(--social-linkedin-alt))",
        },
        'social-twitter': {
          DEFAULT: "hsl(var(--social-twitter))",
          hover: "hsl(var(--social-twitter-hover))",
        },
        
        // Semantic Status Colors - Fase 14
        status: {
          success: {
            DEFAULT: "hsl(var(--status-success))",
            light: "hsl(var(--status-success-light))",
            lighter: "hsl(var(--status-success-lighter))",
            dark: "hsl(var(--status-success-dark))",
          },
          error: {
            DEFAULT: "hsl(var(--status-error))",
            light: "hsl(var(--status-error-light))",
            lighter: "hsl(var(--status-error-lighter))",
            dark: "hsl(var(--status-error-dark))",
          },
          warning: {
            DEFAULT: "hsl(var(--status-warning))",
            light: "hsl(var(--status-warning-light))",
            lighter: "hsl(var(--status-warning-lighter))",
            dark: "hsl(var(--status-warning-dark))",
          },
          info: {
            DEFAULT: "hsl(var(--status-info))",
            light: "hsl(var(--status-info-light))",
            lighter: "hsl(var(--status-info-lighter))",
            dark: "hsl(var(--status-info-dark))",
          },
          neutral: {
            DEFAULT: "hsl(var(--status-neutral))",
            light: "hsl(var(--status-neutral-light))",
            lighter: "hsl(var(--status-neutral-lighter))",
            dark: "hsl(var(--status-neutral-dark))",
          },
        },
        
  // Priority System
  priority: {
    low: "hsl(var(--priority-low))",
    normal: "hsl(var(--priority-normal))",
    high: "hsl(var(--priority-high))",
    urgent: "hsl(var(--priority-urgent))",
  },
  
  // System Health - Fase 14.1
  system: {
    healthy: "hsl(var(--system-healthy))",
    warning: "hsl(var(--system-warning))",
    critical: "hsl(var(--system-critical))",
  },
  
  // Severity Colors - Security & Alerts - Fase 14.2
  severity: {
    critical: "hsl(var(--severity-critical))",
    high: "hsl(var(--severity-high))",
    medium: "hsl(var(--severity-medium))",
    low: "hsl(var(--severity-low))",
    info: "hsl(var(--severity-info))",
  },
  
  // Permission Colors - Access Control - Fase 14.2
  permission: {
    granted: "hsl(var(--permission-granted))",
    partial: "hsl(var(--permission-partial))",
    denied: "hsl(var(--permission-denied))",
    restricted: "hsl(var(--permission-restricted))",
  },
  
  // Difficulty Levels - Content Complexity - Fase 14.2
  difficulty: {
    beginner: "hsl(var(--difficulty-beginner))",
    intermediate: "hsl(var(--difficulty-intermediate))",
    advanced: "hsl(var(--difficulty-advanced))",
    expert: "hsl(var(--difficulty-expert))",
  },
  
  // Performance Colors - Speed Metrics - Fase 14.2
  performance: {
    excellent: "hsl(var(--performance-excellent))",
    good: "hsl(var(--performance-good))",
    fair: "hsl(var(--performance-fair))",
    poor: "hsl(var(--performance-poor))",
  },
        
        // Email Tracking
        tracking: {
          sent: "hsl(var(--tracking-sent))",
          delivered: "hsl(var(--tracking-delivered))",
          opened: "hsl(var(--tracking-opened))",
          clicked: "hsl(var(--tracking-clicked))",
          bounced: "hsl(var(--tracking-bounced))",
          failed: "hsl(var(--tracking-failed))",
        },
      },
      
      // Gradientes customizados
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // === SEMANTIC GRADIENTS - BATCH 4 ===
        // Brand gradients
        'gradient-aurora': 'linear-gradient(135deg, hsl(var(--aurora-primary)), hsl(var(--aurora-primary-light)))',
        'gradient-aurora-subtle': 'linear-gradient(135deg, hsl(var(--aurora-primary) / 0.1), hsl(var(--aurora-primary-light) / 0.05))',
        'gradient-primary': 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--operational)))',
        'gradient-primary-subtle': 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1))',
        
        // Track gradients
        'gradient-revenue': 'linear-gradient(135deg, hsl(var(--revenue)), hsl(var(--strategy)))',
        'gradient-revenue-subtle': 'linear-gradient(135deg, hsl(var(--revenue) / 0.2), hsl(var(--strategy) / 0.2))',
        'gradient-operational': 'linear-gradient(135deg, hsl(var(--operational)), hsl(var(--aurora-primary)))',
        'gradient-operational-subtle': 'linear-gradient(135deg, hsl(var(--operational) / 0.2), hsl(var(--aurora-primary) / 0.2))',
        'gradient-strategy': 'linear-gradient(135deg, hsl(var(--strategy)), hsl(var(--revenue)))',
        'gradient-strategy-subtle': 'linear-gradient(135deg, hsl(var(--strategy) / 0.2), hsl(var(--revenue) / 0.2))',
        
        // Status gradients
        'gradient-success': 'linear-gradient(135deg, hsl(var(--status-success)), hsl(var(--status-success-light)))',
        'gradient-success-subtle': 'linear-gradient(135deg, hsl(var(--status-success) / 0.15), transparent)',
        'gradient-error': 'linear-gradient(135deg, hsl(var(--status-error)), hsl(var(--status-error-light)))',
        'gradient-error-subtle': 'linear-gradient(135deg, hsl(var(--status-error) / 0.15), hsl(var(--status-error) / 0.05))',
        'gradient-warning': 'linear-gradient(135deg, hsl(var(--status-warning)), hsl(var(--status-error)))',
        'gradient-warning-subtle': 'linear-gradient(135deg, hsl(var(--status-warning) / 0.1), hsl(var(--status-error) / 0.05))',
        
        // Neutral gradients
        'gradient-muted': 'linear-gradient(135deg, hsl(var(--muted) / 0.2), hsl(var(--muted) / 0.1))',
        'gradient-surface': 'linear-gradient(135deg, hsl(var(--surface-elevated)), hsl(var(--surface-base)))',
        
        // Severity gradients (security)
        'gradient-severity': 'linear-gradient(135deg, hsl(var(--severity-low)), hsl(var(--severity-medium)))',
        'gradient-severity-critical': 'linear-gradient(135deg, hsl(var(--severity-critical)), hsl(var(--severity-high)))',
      },
      
      // Sombras Aurora aprimoradas
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        aurora: "var(--shadow-aurora)",
        "aurora-strong": "var(--shadow-aurora-strong)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // Animações Aurora aprimoradas
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)"
          },
          "100%": {
            opacity: "0",
            transform: "translateY(10px)"
          }
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" }
        },
        
        // Shimmer para skeletons
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        
        // Hover elevation
        "hover-lift": {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-2px) scale(1.02)" }
        },
        
        // Aurora glow effect
        "aurora-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(var(--primary) / 0.1)" 
          },
          "50%": { 
            boxShadow: "0 0 30px hsl(var(--primary) / 0.2)" 
          }
        },
        
        // Rotação lenta
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        
        // Blob animation
        "blob": {
          "0%": {
            transform: "translate(0px, 0px) scale(1)"
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)"
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)"
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)"
          }
        },
        
        // Float animation
        "float": {
          "0%, 100%": {
            transform: "translateY(0)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "hover-lift": "hover-lift 0.2s ease-out",
        "aurora-glow": "aurora-glow 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "blob": "blob 7s infinite",
        "float": "float 4s ease-in-out infinite",
        
        // Combinações de animações
        "enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
        "exit": "fade-out 0.3s ease-out, scale-out 0.2s ease-out"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
