
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        viverblue: {
          DEFAULT: "#0ABAB5",
          light: "#3DCCC7",
          dark: "#07807C"
        },
        revenue: {
          DEFAULT: "#3949AB",
          light: "#7986CB",
          dark: "#1A237E",
          lighter: "#C5CAE9",
          darker: "#0D1642"
        },
        operational: {
          DEFAULT: "#8E24AA",
          light: "#BA68C8",
          dark: "#4A148C",
          lighter: "#E1BEE7",
          darker: "#2A0B50"
        },
        strategy: {
          DEFAULT: "#00897B",
          light: "#4DB6AC",
          dark: "#004D40",
          lighter: "#B2DFDB",
          darker: "#002B23"
        }
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-viver': 'linear-gradient(135deg, #0ABAB5 0%, #6de2de 100%)',
        'gradient-revenue': 'linear-gradient(135deg, #1A237E 0%, #3949AB 100%)',
        'gradient-operational': 'linear-gradient(135deg, #4A148C 0%, #8E24AA 100%)',
        'gradient-strategy': 'linear-gradient(135deg, #004D40 0%, #00897B 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        'dot-pattern': 'radial-gradient(circle, #0ABAB5 1px, transparent 1px)',
      },
      backgroundSize: {
        'size-200': '200% 200%',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
