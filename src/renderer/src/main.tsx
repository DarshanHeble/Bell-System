import './assets/main.css'

import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none'
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none'
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 42
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
          '& .MuiSwitch-track': {
            borderRadius: 22 / 2,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16
            },
            '&::before': {
              // backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="primary.main" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
              left: 12
            },
            '&::after': {
              // backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="primary.main" d="M19,13H5V11H19V13Z" /></svg>')`,
              right: 12
            }
          },
          '& .MuiSwitch-thumb': {
            // boxShadow: 'none',
            width: 16,
            height: 16,
            margin: 2
          }
        }
      }
    }
  }
})

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
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Toaster richColors theme="dark" />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
