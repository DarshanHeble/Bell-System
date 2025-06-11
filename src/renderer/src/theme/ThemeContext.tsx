import { createContext, useContext, useState, ReactNode } from 'react'
import { Theme } from '@mui/material'
import { darkTheme } from './darkTheme'
import { lightTheme } from './lightTheme'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDarkMode: boolean
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = isDarkMode ? darkTheme : lightTheme

  const toggleTheme = (): void => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
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
