'use client'

// import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'system' | 'dark'

const themes: Theme[] = ['light', 'system', 'dark']

const themeLabels: Record<Theme, string> = {
  light: 'Modo claro',
  system: 'Tema del sistema',
  dark: 'Modo oscuro',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        'flex h-9 items-center gap-1 rounded-full p-1',
        'bg-secondary/50 transition-all duration-300',
        'border border-border/50'
      )}
      role="radiogroup"
      aria-label="Seleccionar tema"
    >
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={cn(
            'relative flex h-7 w-7 items-center justify-center rounded-full text-lg',
            'transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            theme === t
              ? 'bg-primary text-primary-foreground shadow-md scale-110'
              : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground hover:scale-105'
          )}
          role="radio"
          aria-checked={theme === t}
          aria-label={themeLabels[t]}
        >
          {t === 'light' && <span className="filter drop-shadow-sm">☀️</span>}
          {t === 'system' && <span className="filter drop-shadow-sm">💻</span>}
          {t === 'dark' && (
            <span 
              style={{ 
                filter: theme === 'dark' 
                  ? 'grayscale(100%) brightness(0.2) contrast(2)' 
                  : 'none'
              }}
            >
              🌙
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
