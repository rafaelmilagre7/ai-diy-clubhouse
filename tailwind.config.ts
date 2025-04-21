
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
                // VIVER DE IA colors - enhanced with more variants
                viverblue: {
                    DEFAULT: '#0ABAB5',
                    light: '#6de2de',
                    lighter: '#9EECEA',
                    dark: '#068d89',
                    darker: '#046A66',
                },
                // Revenue track colors - enhanced
                revenue: {
                    DEFAULT: '#3949AB',
                    light: '#7986CB',
                    lighter: '#C5CAE9',
                    dark: '#1A237E',
                    darker: '#0D1642',
                },
                // Operational track colors - enhanced 
                operational: {
                    DEFAULT: '#8E24AA',
                    light: '#BA68C8',
                    lighter: '#E1BEE7',
                    dark: '#4A148C',
                    darker: '#2A0B50',
                },
                // Strategy track colors - enhanced
                strategy: {
                    DEFAULT: '#00897B',
                    light: '#4DB6AC',
                    lighter: '#B2DFDB',
                    dark: '#004D40',
                    darker: '#002B23',
                },
                // New neutral palette
                neutral: {
                    100: '#F8FAFC',
                    200: '#EEF2F6',
                    300: '#E3E8EF',
                    400: '#CDD5E0',
                    500: '#9AA5B8',
                    600: '#657084',
                    700: '#47536B',
                    800: '#2F3847',
                    900: '#1C2536',
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
                        boxShadow: '0 0 0 0 rgba(10, 186, 181, 0.7)' 
                    },
                    '50%': { 
                        boxShadow: '0 0 20px 10px rgba(10, 186, 181, 0.4)' 
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
                'gradient-viver': 'linear-gradient(135deg, #0ABAB5 0%, #6de2de 100%)',
                'gradient-revenue': 'linear-gradient(135deg, #1A237E 0%, #3949AB 100%)',
                'gradient-operational': 'linear-gradient(135deg, #4A148C 0%, #8E24AA 100%)',
                'gradient-strategy': 'linear-gradient(135deg, #004D40 0%, #00897B 100%)',
                'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                'dot-pattern': 'radial-gradient(circle, #0ABAB5 1px, transparent 1px)',
            },
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
