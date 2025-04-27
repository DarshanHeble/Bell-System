import { useEffect, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import ManageAudioFiles from './pages/ManageAudioFiles'
import Lock from './pages/lock'
import BellTab from './pages/BellTab'
import Sidebar from './components/Sidebar'
import NewHome from './pages/NewHome'
import { TabWithOutTimeData } from '@shared/type'
import { fetchTabs } from './api'
// import Home from './pages/home'

function App(): JSX.Element {
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [tabs, setTabs] = useState<TabWithOutTimeData[]>([])

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

  // API for fetching data from DB
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const fetchedTabs: TabWithOutTimeData[] = await fetchTabs()
        // console.log('fetchedTabs', fetchedTabs)
        setTabs(fetchedTabs)

        // if (fetchedTabs.length > 0) {
        //   setActiveTab(fetchedTabs[0]._id)
        //   // console.log('set active', activeTab)
        // }
      } catch (error) {
        console.error('Error fetching tabs:', error)
      }
    }

    fetchData()
  }, [])

  // Find the initially active tab to redirect to it
  const initialActiveTab = tabs.find((tab) => tab.isActive)
  const initialRoute = initialActiveTab ? `/tabs/${initialActiveTab._id}` : '/'

  // console.log(initialActiveTab)

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
    <HashRouter>
      <div style={{ display: 'flex', height: '-webkit-fill-available' }}>
        <Sidebar />
        <Routes>
          {isVerified ? (
            <>
              <Route path="/" element={<NewHome />} />
              <Route path="/tabs/:tabId" Component={BellTab} />
              <Route path="/manageAudioFiles" Component={ManageAudioFiles} />
              {initialActiveTab && (
                <Route path="/" element={<Navigate to={initialRoute} replace />} />
              )}
            </>
          ) : (
            <>
              <Route path="/" element={<Lock setVerified={setIsVerified} />} />
            </>
          )}
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
