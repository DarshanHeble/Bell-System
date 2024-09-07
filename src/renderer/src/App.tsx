import { Box, CircularProgress, createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import Home from './components/pages/home'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ManageAudioFiles from './components/pages/ManageAudioFiles'
import Lock from './components/pages/lock'
import { useEffect, useState } from 'react'

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})

function App(): JSX.Element {
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadingSetTimeOut = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    // Check if the user has already verified (from Electron Store)
    const checkUserVerified = async (): Promise<void> => {
      const response: boolean = await window.electron.ipcRenderer.invoke('checkUserIsVerified')
      setIsVerified(response)
    }
    checkUserVerified()

    // clear timeout when the component unmounts
    return (): void => clearTimeout(loadingSetTimeOut)
  }, [])

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'black',
          height: '100vh'
        }}
      >
        <CircularProgress size={'6rem'} />
      </Box>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          {/* If the user is verified, redirect to the home page */}
          {isVerified ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/manageAudioFiles" element={<ManageAudioFiles />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Lock setVerified={setIsVerified} />} />
            </>
          )}
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
