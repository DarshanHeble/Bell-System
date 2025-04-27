import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Divider,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@mui/material'
import {
  Add,
  DeleteOutlined,
  AudioFileOutlined,
  NotificationsOffRounded
} from '@mui/icons-material'
import { Tab, TimeData } from '@shared/type'
import NewTabDialog from '../components/dialogs/NewTabDialog'
import AlarmDialog from '../components/dialogs/AlarmDialog'
import { checkTimeMatch } from '@renderer/utils'
import { useNavigate } from 'react-router-dom'
import AlarmCard from '../components/smallComponents/AlarmCard'
import HoverableSidebarBox from '../components/smallComponents/HoverableSidebarBox'
import { sortTimeData } from '@shared/utils'
import { v4 } from 'uuid'

function Home(): JSX.Element {
  const navigate = useNavigate()
  // AlarmDialog
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)
  // AlarmDialog

  // const [, SetData] = useState<Tab[]>(timeData)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  // const [previousActiveTab, setPreviousActiveTab] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const tabsRef = useRef(tabs) // Use ref to store the latest tabs state
  const activeTabRef = useRef(activeTab) // Use ref to store the active tab state
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null) // Use ref to store interval ID

  const [cardContextMenu, setCardContextMenu] = useState<{
    mouseX: number
    mouseY: number
    data: TimeData
  } | null>(null)

  const handleContextMenu = (event: React.MouseEvent, timeData: TimeData): void => {
    event.preventDefault()
    // console.log(timeData)

    setCardContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      data: timeData
    })
    // console.log(cardContextMenu)
  }

  useEffect(() => {
    tabsRef.current = tabs // Update ref to the latest tabs state
  }, [tabs])

  useEffect(() => {
    activeTabRef.current = activeTab
    // const activeTabIndex = tabs.findIndex((tab) => {
    //   tab._id == activeTab
    // })

    // if (activeTabIndex) {

    // }
  }, [activeTab])

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      checkTimeMatch(tabsRef.current, activeTabRef.current)
    }, 1000) // Check every second

    return (): void => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current) // Clear interval on component unmount
      }
    }
  }, [])

  // API for fetching data from DB
  useEffect(() => {
    const fetchTabs = async (): Promise<void> => {
      try {
        const fetchedTabs: Tab[] = await window.electron.ipcRenderer.invoke('getTabs')
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

    fetchTabs()
  }, [])

  // useEffect(() => {
  //   console.log('Updated cardContextMenu:', cardContextMenu)
  // }, [cardContextMenu])

  const handleAddTab = (newTabData: Tab): void => {
    tabs.push(newTabData)

    // API for data store
    // window.electron.ipcRenderer.invoke('addTab', newTabData)

    // not needed
    // SetData((prevData) => [...prevData, newTabData])

    setActiveTab(newTabData._id)
  }

  const TabDelete = (_id: string): void => {
    setTabs((previousTabs) => previousTabs.filter((tab: Tab) => tab._id !== _id))
  }

  const TabRename = (_id: string, newTabName: string): void => {
    console.log('tabId', _id, 'new name', newTabName)
    setTabs((prevTabData: Tab[]) =>
      prevTabData.map((tab: Tab) =>
        tab._id === _id ? { ...tab, tab_id: newTabName, tab_name: newTabName } : tab
      )
    )
  }

  const handleTimeAdd = (_id: string, newTimeData: TimeData): void => {
    // console.log(_id, newTimeData)
    const tabIndex = tabs.findIndex((tab) => tab._id === activeTab)

    newTimeData = {
      id: newTimeData.id || v4(), // make sure id is passed
      ...newTimeData
    }

    if (tabIndex == -1) {
      console.error('index not found')
    } else {
      tabs[tabIndex].data = sortTimeData([...tabs[tabIndex].data, newTimeData])
    }

    window.electron.ipcRenderer.invoke('addTimeData', _id, newTimeData)
  }

  const handleTimeDelete = async (): Promise<void> => {
    // console.log(cardContextMenu)

    if (cardContextMenu) {
      const { data } = cardContextMenu
      // console.log(data)
      await window.electron.ipcRenderer.invoke('deleteTimeData', activeTab, data)

      if (data.id) {
        console.log('id available so delete it with id')

        setTabs((prevTabs) => prevTabs.filter((tabs) => tabs._id != data.id))
      } else {
        // Update the tabs state
        setTabs((prevTabs) => {
          // Find the index of the active tab
          const tabIndex = prevTabs.findIndex((tab) => tab._id === activeTab)

          // If the tab is found
          if (tabIndex !== -1) {
            // Create a copy of the tabs array
            const updatedTabs = [...prevTabs]

            // Filter out the specific TimeData from the tab's data array
            const updatedData = updatedTabs[tabIndex].data.filter(
              (timeData) =>
                timeData.time.hour !== data.time.hour ||
                timeData.time.minute !== data.time.minute ||
                timeData.time.period !== data.time.period ||
                timeData.label !== data.label
            )

            // Update the tab's data array with the filtered data
            updatedTabs[tabIndex] = {
              ...updatedTabs[tabIndex],
              data: updatedData
            }

            // Return the updated tabs array to update the state
            return updatedTabs
          }

          // If the tab is not found, return the previous tabs state
          return prevTabs
        })
      }
    }

    setCardContextMenu(null)
  }

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Box
          sx={{
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

        {/* alarm content window */}
        <Box sx={{ width: '100%', position: 'relative' }}>
          {tabs.map((tabData, index) => (
            <Box
              key={index}
              className="window"
              sx={{
                position: 'absolute',
                bgcolor: 'black',
                zIndex: tabData._id == activeTab ? 11 : 10
              }}
            >
              {tabData.data.length === 0 ? (
                <Container
                  sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute'
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    No bells
                    <NotificationsOffRounded sx={{ fontSize: '4rem', color: 'gold' }} /> to show.
                  </Typography>
                </Container>
              ) : (
                tabData.data.map((item, index) => (
                  <AlarmCard
                    key={index}
                    data={item}
                    tab_id={tabData._id}
                    onContextMenu={handleContextMenu}
                  />
                ))
              )}
              <Fab
                variant="extended"
                sx={{ position: 'fixed', bottom: '3rem', right: '3rem', textTransform: 'none' }}
                onClick={handleOpen}
              >
                <Add sx={{ mr: 1 }} /> New Alarm
              </Fab>
            </Box>
          ))}
        </Box>
      </Box>
      <NewTabDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAddTab={handleAddTab}
      />
      <AlarmDialog
        open={open}
        handleClose={handleClose}
        onTimeAdd={handleTimeAdd}
        activeTab={activeTab}
      />
      <Menu
        id="cardMenu"
        open={cardContextMenu !== null}
        onClose={() => setCardContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          cardContextMenu !== null
            ? { top: cardContextMenu.mouseY, left: cardContextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleTimeDelete}>
          <DeleteOutlined sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  )
}

export default Home
