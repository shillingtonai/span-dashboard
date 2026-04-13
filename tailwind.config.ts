import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0A0F',
        'bg-surface': '#13131A',
        'bg-elevated': '#1A1A24',
        'border-subtle': '#1E1E2E',
        'border-default': '#2A2A3E',
        'accent-primary': '#00E5A0',
        'accent-secondary': '#3B82F6',
        'text-primary': '#F0F0F5',
        'text-secondary': '#A0A0B0',
        'text-muted': '#6B7280',
        'status-up': '#00E5A0',
        'status-down': '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        badge: '6px',
      },
    },
  },
  plugins: [],
}

export default config
