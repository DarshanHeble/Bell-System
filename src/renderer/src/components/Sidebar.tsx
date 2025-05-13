import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'
import HoverableSidebarBox from './smallComponents/HoverableSidebarBox'
import { Add, AudioFileOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import NewTabDialog from './dialogs/NewTabDialog'
import { useEffect, useState } from 'react'
import { Tab, TabWithOutTimeData } from '@shared/type'
import { fetchTabs } from '@renderer/api'

const Sidebar = (): JSX.Element => {
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)

  const [tabs, setTabs] = useState<TabWithOutTimeData[]>([])
  const [activeTab, setActiveTab] = useState<string>('')

  // API for fetching data from DB
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const fetchedTabs: TabWithOutTimeData[] = await fetchTabs()
        console.log('fetchedTabs', fetchedTabs)
        setTabs(fetchedTabs)

        if (fetchedTabs.length > 0) {
          setActiveTab(fetchedTabs[0]._id)
          // console.log('set active', activeTab)
        }
      } catch (error) {
        console.error('Error fetching tabs:', error)
      }
    }

    fetchData()
  }, [])

  const handleAddTab = (newTabData: Tab): void => {
    tabs.push(newTabData)

    // API for data store
    // window.electron.ipcRenderer.invoke('addTab', newTabData)

    // not needed
    // SetData((prevData) => [...prevData, newTabData])

    setActiveTab(newTabData._id)
  }

  const TabDelete = (_id: string): void => {
    setTabs((previousTabs) => previousTabs.filter((tab: TabWithOutTimeData) => tab._id !== _id))
  }

  const TabRename = (_id: string, newTabName: string): void => {
    console.log('tabId', _id, 'new name', newTabName)
    setTabs((prevTabData: TabWithOutTimeData[]) =>
      prevTabData.map((tab: TabWithOutTimeData) =>
        tab._id === _id ? { ...tab, tab_id: newTabName, tab_name: newTabName } : tab
      )
    )
  }

  return (
    <>
      <Box
        sx={{
          minWidth: '15rem',
          height: '-webkit-fill-available',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: '1rem',
          bgcolor: '#202020'
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 5, textTransform: 'none', width: 'fit-content' }}
        >
          New Tab
        </Button>
        {tabs.length === 0 ? (
          ' No Tabs Found'
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}>
            <Typography>All Tabs</Typography>
            {tabs.map((data, index) => (
              <HoverableSidebarBox
                key={index}
                data={data}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onTabDelete={TabDelete}
                onTabRename={TabRename}
              />
            ))}
          </Box>
        )}
        <Divider sx={{ mt: 'auto' }} />
        <List>
          <ListItem disablePadding sx={{ minWidth: 'max-content' }}>
            <ListItemButton
              sx={{ borderRadius: '5rem' }}
              onClick={() => navigate('/manageAudioFiles')}
            >
              <ListItemIcon>
                <AudioFileOutlined />
              </ListItemIcon>
              <ListItemText primary="Manage files" sx={{ textAlign: 'left' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <NewTabDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAddTab={handleAddTab}
      />
    </>
  )
}

export default Sidebar
