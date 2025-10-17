
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
