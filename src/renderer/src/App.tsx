import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
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

  useEffect(() => {
    // Check if the user has already verified (from Electron Store)
  }, [])

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
