import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import Home from './components/pages/home'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ManageAudioFiles from './components/pages/ManageAudioFiles'

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})
function App(): JSX.Element {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manageAudioFiles" element={<ManageAudioFiles />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
