import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme, Theme } from '../../contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const themes: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: MonitorIcon }
  ]

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`relative p-2 rounded-lg transition-colors ${
            theme === value
              ? 'bg-primary-100 text-primary-600'
              : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
          }`}
          title={label}
        >
          <Icon className="h-4 w-4" />
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-primary-100 rounded-lg -z-10"
              initial={false}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
      {showLabel && (
        <span className="ml-2 text-sm text-secondary-600">
          {themes.find(t => t.value === theme)?.label}
        </span>
      )}
    </div>
  )
}

// Simplified theme toggle for mobile/compact spaces
export function SimpleThemeToggle({ className = '' }: { className?: string }) {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors ${className}`}
      title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {actualTheme === 'light' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  )
}