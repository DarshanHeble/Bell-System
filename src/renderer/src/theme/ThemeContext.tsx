import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme } from '@mui/material'
import { darkTheme } from './darkTheme'
import { lightTheme } from './lightTheme'
import { OtherDataType } from '@shared/type'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDarkMode: boolean
  themePreference: 'light' | 'dark' | 'system'
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system')
  const theme = isDarkMode ? darkTheme : lightTheme

  // Load initial theme preference
  useEffect(() => {
    const loadThemePreference = async (): Promise<void> => {
      try {
        const theme = (await window.electron.ipcRenderer.invoke(
          'getTheme'
        )) as OtherDataType['theme']
        setThemePreference(theme)

        if (theme === 'system') {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setIsDarkMode(prefersDark)
        } else {
          setIsDarkMode(theme === 'dark')
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error)
      }
    }
    loadThemePreference()
  }, [])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent): void => {
        setIsDarkMode(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return (): void => mediaQuery.removeEventListener('change', handleChange)
    }
    return undefined
  }, [themePreference])

  const toggleTheme = async (): Promise<void> => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    const newTheme = newMode ? 'dark' : 'light'
    setThemePreference(newTheme)

    try {
      await window.electron.ipcRenderer.invoke('updateTheme', newTheme)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode, themePreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
