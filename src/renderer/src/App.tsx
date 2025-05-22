import { useEffect, useState, useMemo } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import ManageAudioFiles from './pages/ManageAudioFiles'
import Lock from './pages/lock'
import BellTab from './pages/BellTab'
import Sidebar from './components/Sidebar'
import { checkUserIsVerified } from './Apis/other'
import { useQuery } from '@tanstack/react-query'
import EmptyTabs from './pages/EmptyTabs'
import { TabWithOutTimeData, TimeData } from '@shared/type'
import { fetchTabs } from './Apis/tab'
import { playAudio } from './utils/playAudio'

function App(): JSX.Element {
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [isDataReady, setIsDataReady] = useState<boolean>(false)

  const [tabs, setTabs] = useState<TabWithOutTimeData[]>([])
  const [activeTab, setActiveTab] = useState<string>('')

  const { data: initData, isLoading } = useQuery({
    queryKey: ['init'],
    queryFn: async () => {
      const [isUserVerified, fetchedTabs] = await Promise.all([checkUserIsVerified(), fetchTabs()])
      setTabs(fetchedTabs)
      setActiveTab(fetchedTabs[0]._id)

      return { isUserVerified, fetchedTabs }
    }
  })

  // Update state when data changes
  useEffect(() => {
    if (initData?.isUserVerified) {
      setIsVerified(initData.isUserVerified)
      setIsDataReady(true)
    }
  }, [initData])

  // Handle audio play event from main process
  useEffect(() => {
    function handlePlayAudio(_, timeData: TimeData): void {
      playAudio(timeData)
    }

    window.electron.ipcRenderer.on('play-audio', handlePlayAudio)
  }, [])

  // Memoize the active tab calculation
  const { defaultRoute } = useMemo(() => {
    const tabs = initData?.fetchedTabs || []
    const activeTab = tabs.find((tab) => tab.isActive === true)
    if (activeTab) setActiveTab(activeTab._id)
    const firstTab = tabs[0]
    return {
      defaultRoute: activeTab
        ? `/tabs/${activeTab._id}`
        : firstTab
          ? `/tabs/${firstTab._id}`
          : '/tabs/none'
    }
  }, [initData])

  if (isLoading || !isDataReady) {
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
        {isVerified && (
          <Sidebar
            tabs={tabs}
            activeTab={activeTab}
            setTabs={setTabs}
            setActiveTab={setActiveTab}
          />
        )}
        <Routes>
          {isVerified ? (
            <>
              <Route path="/" element={<Navigate to={defaultRoute} replace />} />
              <Route
                path="/tabs/none"
                element={
                  <EmptyTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setTabs={setTabs}
                    setActiveTab={setActiveTab}
                  />
                }
              />
              <Route path="/tabs/:tabId" Component={BellTab} />
              <Route path="/manageAudioFiles" Component={ManageAudioFiles} />
            </>
          ) : (
            <Route path="/" element={<Lock setVerified={setIsVerified} />} />
          )}
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
