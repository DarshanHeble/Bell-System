import { FC, useState } from 'react'
import {
  Box,
  Divider,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Switch
} from '@mui/material'
import { Add, AudioFileOutlined, DarkModeOutlined } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tab, TabWithOut_Id, TabWithOutTimeData } from '@shared/type'
import NameDialog from './dialogs/NameDialog'
import TabList from './smallComponents/TabList'
import { stopScheduler } from '@renderer/Apis/scheduler'
import { updateActiveTab } from '@renderer/Apis/tab'
import { useTheme } from '@renderer/theme/ThemeContext'

interface SidebarProps {
  tabs: TabWithOutTimeData[]
  activeTab: string
  setTabs: React.Dispatch<React.SetStateAction<TabWithOutTimeData[]>>
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
}

const Sidebar: FC<SidebarProps> = ({ tabs, activeTab, setTabs, setActiveTab }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleTheme, isDarkMode } = useTheme()

  const [nameDialogOpen, setNameDialogOpen] = useState(false)

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
    updateActiveTab(finalNewTabData._id, activeTab)
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
          stopScheduler() // Stop the scheduler if no tabs are available
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
          minWidth: '17rem',
          maxWidth: '17rem',
          // height: '-webkit-fill-available',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 3,
          p: '1rem',
          borderRight: '1px solid',
          borderColor: isDarkMode ? '#ffffff1f' : '#e0e0e0'
        }}
      >
        <Fab
          variant="extended"
          color="default"
          sx={{ width: 'fit-content', height: '3.5rem', borderRadius: 4 }}
          onClick={() => setNameDialogOpen(true)}
        >
          <Add />
          <span style={{ marginLeft: '0.5rem' }}>New Tab</span>
        </Fab>
        {tabs.length === 0 ? (
          ' No Tabs Found'
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}>
            <List>
              <ListSubheader sx={{ bgcolor: 'transparent' }}>All Tabs</ListSubheader>
              {tabs.map((data, index) => (
                <TabList
                  key={index}
                  data={data}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onTabDelete={TabDelete}
                  onTabRename={TabRename}
                />
              ))}
            </List>
          </Box>
        )}
        <List sx={{ mt: 'auto' }}>
          <Divider sx={{ marginBlockEnd: '1rem' }} />
          <ListItem
            disablePadding
            sx={{
              minWidth: 'max-content',
              borderRadius: '5rem',
              backgroundColor: location.pathname.includes('manageAudioFiles') ? 'primary.main' : ''
            }}
          >
            <ListItemButton
              sx={{
                borderRadius: '5rem',
                color: location.pathname.includes('manageAudioFiles') ? 'black' : ''
              }}
              // selected={location.pathname.includes('manageAudioFiles')}
              onClick={() => navigate('/manageAudioFiles')}
            >
              <ListItemIcon
                sx={{ color: location.pathname.includes('manageAudioFiles') ? 'black' : '' }}
              >
                <AudioFileOutlined />
              </ListItemIcon>
              <ListItemText primary="Manage files" sx={{ textAlign: 'left' }} />
            </ListItemButton>
          </ListItem>
          <ListItem
            disablePadding
            sx={{ borderRadius: '5rem' }}
            secondaryAction={<Switch onChange={toggleTheme} checked={isDarkMode}></Switch>}
          >
            <ListItemButton onClick={toggleTheme} sx={{ borderRadius: '5rem' }}>
              <ListItemIcon>
                <DarkModeOutlined />
              </ListItemIcon>
              <ListItemText>Dark theme</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <NameDialog
        open={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        title="Create New Tab"
        label="Tab Name"
        onSubmit={handleAddTab}
      />
    </>
  )
}

export default Sidebar
