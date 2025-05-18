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
import { FC, useEffect, useState } from 'react'
import { Tab, TabWithOut_Id, TabWithOutTimeData } from '@shared/type'
import { fetchTabs } from '@renderer/api'
import NameDialog from './dialogs/NameDialog'

interface SidebarProps {
  tabs: TabWithOutTimeData[]
  activeTab: string
  setTabs: React.Dispatch<React.SetStateAction<TabWithOutTimeData[]>>
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
}

const Sidebar: FC<SidebarProps> = ({ tabs, activeTab, setTabs, setActiveTab }) => {
  const navigate = useNavigate()
  const [nameDialogOpen, setNameDialogOpen] = useState(false)

  // const [tabs, setTabs] = useState<TabWithOutTimeData[]>([])
  // const [activeTab, setActiveTab] = useState<string>('')

  // API for fetching data from DB
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const fetchedTabs: TabWithOutTimeData[] = await fetchTabs()
        // console.log('fetchedTabs', fetchedTabs)
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

  const handleAddTab = async (tabName: string): Promise<void> => {
    const newTabData: TabWithOut_Id = {
      tab_id: tabName,
      tab_name: tabName,
      data: []
    }

    // API for data store
    const _id = await window.electron.ipcRenderer.invoke('addTab', newTabData)

    const finalNewTabData: Tab = {
      ...newTabData,
      _id: _id
    }

    tabs.push(finalNewTabData)

    // not needed
    // SetData((prevData) => [...prevData, newTabData])

    setActiveTab(finalNewTabData._id)
    navigate(`/tabs/${_id}`)
  }

  const TabDelete = (_id: string): void => {
    setTabs((previousTabs) => {
      const updatedTabs = previousTabs.filter((tab: TabWithOutTimeData) => tab._id !== _id)

      // If the active tab is deleted, navigate to the first available tab or fallback
      if (activeTab === _id) {
        if (updatedTabs.length > 0) {
          const firstTab = updatedTabs[0]
          setActiveTab(firstTab._id)
          navigate(`/tabs/${firstTab._id}`)
        } else {
          setActiveTab('')
          navigate('tabs/none') // Navigate to a fallback route when no tabs remain
        }
      }

      return updatedTabs
    })
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
          onClick={() => setNameDialogOpen(true)}
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
        <List sx={{ mt: 'auto' }}>
          <Divider sx={{ marginBlockEnd: '1rem' }} />
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
      {/* <NewTabDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAddTab={handleAddTab}
      /> */}
      <NameDialog
        open={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        title="Create New Tab"
        label="Name"
        onSubmit={handleAddTab}
      />
    </>
  )
}

export default Sidebar
