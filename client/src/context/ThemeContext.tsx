import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type AccentTheme = 'cyan' | 'violet' | 'emerald' | 'rose'

export interface ThemeConfig {
  id: AccentTheme
  name: string
  primary: string
  secondary: string
  glow: string
  bgGlow: string
  borderGlow: string
}

export const THEMES: Record<AccentTheme, ThemeConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    primary: '#3d81e3',
    secondary: '#4dd0e6',
    glow: 'rgba(77, 208, 230, 0.45)',
    bgGlow: 'rgba(61, 129, 227, 0.22)',
    borderGlow: 'rgba(77, 208, 230, 0.3)',
  },
  violet: {
    id: 'violet',
    name: 'Cyber Violet',
    primary: '#8b5cf6',
    secondary: '#d946ef',
    glow: 'rgba(217, 70, 239, 0.45)',
    bgGlow: 'rgba(139, 92, 246, 0.22)',
    borderGlow: 'rgba(217, 70, 239, 0.3)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    primary: '#10b981',
    secondary: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.45)',
    bgGlow: 'rgba(16, 185, 129, 0.22)',
    borderGlow: 'rgba(6, 182, 212, 0.3)',
  },
  rose: {
    id: 'rose',
    name: 'Sunset Rose',
    primary: '#f43f5e',
    secondary: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.45)',
    bgGlow: 'rgba(244, 63, 94, 0.22)',
    borderGlow: 'rgba(251, 146, 60, 0.3)',
  },
}

interface ThemeContextValue {
  theme: AccentTheme
  themeConfig: ThemeConfig
  setTheme: (t: AccentTheme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'flowboard_accent_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AccentTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as AccentTheme | null
      if (saved && THEMES[saved]) return saved
    }
    return 'cyan'
  })

  const themeConfig = THEMES[theme]

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-brand', themeConfig.primary)
    root.style.setProperty('--color-brand-2', themeConfig.secondary)
    root.style.setProperty('--color-brand-glow', themeConfig.glow)
    root.style.setProperty('--color-brand-bg-glow', themeConfig.bgGlow)
    root.style.setProperty('--color-brand-border-glow', themeConfig.borderGlow)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme, themeConfig])

  function setTheme(t: AccentTheme) {
    if (THEMES[t]) {
      setThemeState(t)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
