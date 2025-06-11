import { createTheme } from '@mui/material'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#46acff'
    }
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
    MuiFab: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
          '& .MuiSwitch-track': {
            borderRadius: '3rem',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16
            },
            '&::before': {
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="primary.main" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
              left: 12
            },
            '&::after': {
              right: 12
            }
          },
          '& .Mui-checked': {
            '& .MuiSwitch-thumb': {
              backgroundColor: '#ffffff'
            }
          },
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                opacity: 1
              }
            }
          },
          '& .MuiSwitch-thumb': {
            width: 16,
            height: 16,
            margin: 2
          }
        }
      }
    }
  }
})
