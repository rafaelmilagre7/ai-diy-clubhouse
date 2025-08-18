
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
        
        // Combinações de animações
        "enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
        "exit": "fade-out 0.3s ease-out, scale-out 0.2s ease-out"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
