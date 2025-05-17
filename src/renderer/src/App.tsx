import { useEffect, useState, useMemo } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import ManageAudioFiles from './pages/ManageAudioFiles'
import Lock from './pages/lock'
import BellTab from './pages/BellTab'
import Sidebar from './components/Sidebar'
import { checkUserIsVerified, fetchTabs } from './api'
import { useQuery } from '@tanstack/react-query'

function App(): JSX.Element {
  const [isVerified, setIsVerified] = useState<boolean>(false)

  const { data: initData, isLoading } = useQuery({
    queryKey: ['init'],
    queryFn: async () => {
      const [isUserVerified, fetchedTabs] = await Promise.all([checkUserIsVerified(), fetchTabs()])
      return { isUserVerified, fetchedTabs }
    }
  })

  // Update state when data changes
  useEffect(() => {
    if (initData?.isUserVerified) {
      setIsVerified(initData.isUserVerified)
    }
  }, [initData])

  // Memoize the active tab calculation
  const { defaultRoute } = useMemo(() => {
    const tabs = initData?.fetchedTabs || []
    const activeTab = tabs.find((tab) => tab.isActive === true)
    const firstTab = tabs[0]
    return {
      defaultRoute: activeTab ? `/tabs/${activeTab._id}` : firstTab ? `/tabs/${firstTab._id}` : '/'
    }
  }, [initData])

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
          {!isVerified ? (
            <>
              <Route path="/" element={<Navigate to={defaultRoute} replace />} />
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
