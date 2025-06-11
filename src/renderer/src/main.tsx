import './assets/main.css'

import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider, useTheme } from './theme/ThemeContext'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
)

function Provider({ children }: { children: ReactNode }): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedApp>{children}</ThemedApp>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function ThemedApp({ children }: { children: ReactNode }): JSX.Element {
  const { theme, isDarkMode } = useTheme()

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster richColors theme={isDarkMode ? 'dark' : 'light'} position="bottom-center" />
      {children}
    </MuiThemeProvider>
  )
}
