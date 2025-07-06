
import type { Config } from "tailwindcss";

export default {
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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
                // VIVER DE IA colors usando variáveis CSS
                viverblue: {
                    DEFAULT: 'hsl(var(--viverblue))',
                    light: 'hsl(var(--viverblue-light))',
                    lighter: 'hsl(var(--viverblue-lighter))',
                    dark: 'hsl(var(--viverblue-dark))',
                    darker: 'hsl(var(--viverblue-darker))',
                },
                // Revenue track colors usando variáveis CSS
                revenue: {
                    DEFAULT: 'hsl(var(--revenue))',
                    light: 'hsl(var(--revenue-light))',
                    lighter: 'hsl(var(--revenue-lighter))',
                    dark: 'hsl(var(--revenue-dark))',
                    darker: 'hsl(var(--revenue-darker))',
                },
                // Operational track colors usando variáveis CSS
                operational: {
                    DEFAULT: 'hsl(var(--operational))',
                    light: 'hsl(var(--operational-light))',
                    lighter: 'hsl(var(--operational-lighter))',
                    dark: 'hsl(var(--operational-dark))',
                    darker: 'hsl(var(--operational-darker))',
                },
                // Strategy track colors usando variáveis CSS
                strategy: {
                    DEFAULT: 'hsl(var(--strategy))',
                    light: 'hsl(var(--strategy-light))',
                    lighter: 'hsl(var(--strategy-lighter))',
                    dark: 'hsl(var(--strategy-dark))',
                    darker: 'hsl(var(--strategy-darker))',
                },
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
                // Adicionar Inter como fonte principal e Outfit para títulos
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'system-ui', 'sans-serif'],
            },
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
                'celebrate': {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '50%': { transform: 'scale(1.2)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                'confetti': {
                    '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
                    '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
                },
                'pulse-glow': {
                    '0%, 100%': { 
                        boxShadow: '0 0 0 0 hsl(var(--viverblue) / 0.7)' 
                    },
                    '50%': { 
                        boxShadow: '0 0 20px 10px hsl(var(--viverblue) / 0.4)' 
                    }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'slide-in': {
                    '0%': { transform: 'translateX(-10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                'gradient-shift': {
                    '0%, 100%': { 
                        backgroundPosition: '0% 50%' 
                    },
                    '50%': { 
                        backgroundPosition: '100% 50%' 
                    }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
                'celebrate': 'celebrate 0.8s ease-out forwards',
                'confetti': 'confetti 3s ease-out forwards',
                'pulse-glow': 'pulse-glow 2s infinite',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-in': 'slide-in 0.5s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'gradient-shift': 'gradient-shift 3s ease infinite',
                'float': 'float 6s ease-in-out infinite'
			},
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-viver': 'linear-gradient(135deg, hsl(var(--viverblue)) 0%, hsl(var(--viverblue-light)) 100%)',
                'gradient-revenue': 'linear-gradient(135deg, hsl(var(--revenue-dark)) 0%, hsl(var(--revenue)) 100%)',
                'gradient-operational': 'linear-gradient(135deg, hsl(var(--operational-dark)) 0%, hsl(var(--operational)) 100%)',
                'gradient-strategy': 'linear-gradient(135deg, hsl(var(--strategy-dark)) 0%, hsl(var(--strategy)) 100%)',
                'gradient-card': 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                'dot-pattern': 'radial-gradient(circle, hsl(var(--viverblue)) 1px, transparent 1px)',
                'dot-pattern-dark': 'radial-gradient(circle, hsl(var(--viverblue-light)) 1px, transparent 1px)',
            },
            backgroundSize: {
                '200': '200% 200%',
                '300': '300% 300%',
            },
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
