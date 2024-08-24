import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@mui/material'

import AlarmIcon from '@mui/icons-material/Alarm'
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import AudioFileOutlinedIcon from '@mui/icons-material/AudioFileOutlined'

import { Tab, TimeData } from '@shared/type'
import NewTabDialog from '../dialogs/NewTabDialog'
import AlarmDialog from '../dialogs/AlarmDialog'
import { checkTimeMatch } from '@renderer/utils'
import RenameTabDialog from '../dialogs/RenameTabDialog'

import { useNavigate } from 'react-router-dom'
import AlarmCard from '../smallComponents/AlarmCard'

function Home(): JSX.Element {
  const navigate = useNavigate()
  // AlarmDialog
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)
  // AlarmDialog

  // const [, SetData] = useState<Tab[]>(timedata)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
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
    console.log(timeData)

    setCardContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      data: timeData
    })
    console.log(cardContextMenu)
  }

  useEffect(() => {
    tabsRef.current = tabs // Update ref to the latest tabs state
  }, [tabs])

  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      checkTimeMatch(tabsRef.current, activeTabRef.current)
    }, 30000) // Check every second

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

    fetchTabs()
  }, [])

  useEffect(() => {
    console.log('Updated cardContextMenu:', cardContextMenu)
  }, [cardContextMenu])

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

    if (tabIndex == -1) {
      console.error('index not found')
    } else {
      tabs[tabIndex].data.push(newTimeData)
      tabs[tabIndex].data.sort()
    }
    window.electron.ipcRenderer.invoke('addTimeData', _id, newTimeData)
  }

  const handleTimeDelete = async (): Promise<void> => {
    console.log(cardContextMenu)

    if (cardContextMenu) {
      const { data } = cardContextMenu
      console.log(data)
      await window.electron.ipcRenderer.invoke('deleteTimeData', activeTab, data)

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

    setCardContextMenu(null)
  }

  return (
    <>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* alarm sidebar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            p: '1rem',
            bgcolor: '#202020'
            // width: '12rem'
          }}
        >
          {/* new button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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

          {/* <Button variant="contained" sx={{ width: 'max-content' }}>
            Manage files
          </Button> */}
          <Divider sx={{ mt: 'auto' }} />
          <List>
            <ListItem disablePadding sx={{ minWidth: 'max-content' }}>
              <ListItemButton
                sx={{ borderRadius: '5rem' }}
                onClick={() => navigate('/manageAudioFiles')}
              >
                <ListItemIcon>
                  <AudioFileOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Manage files" sx={{ textAlign: 'left' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        {/* alarm content window */}
        <Box sx={{ width: '100%', position: 'relative' }}>
          {tabs.map((data, index) => (
            <Box
              key={index}
              className="window"
              sx={{
                position: 'absolute',
                bgcolor: 'black',
                zIndex: data._id == activeTab ? 11 : 10
              }}
            >
              {/* {data.data.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                  position: 'relative',
                    height: 'max-content'
                  }}
                >
                  <CardActionArea
                    id="cardBtn"
                    onContextMenu={handleContextMenu}
                    onClick={handleContextMenu}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', justifyContent: 'start', alignItems: 'baseline' }}
                      >
                        <Typography variant="h3" component="h2" sx={{ fontSize: '3.5rem' }}>
                          {item.time.hour.toString()}:{item.time.minute.toString().padStart(2, '0')}
                        </Typography>
                        <Typography variant="h5" sx={{ ml: 1 }}>
                          {item.time.period}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography> {item.label}</Typography>
                        <Typography>{item.music_file_name} </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {item.days.map((days, index) => (
                            <Typography key={index}>{days.day} </Typography>
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <Switch sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }} />
                </Card>
              ))} */}
              {data.data.length === 0 ? (
                <Container
                  sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute'
                  }}
                >
                  <Typography variant="h3">No bells 🔕 to show.</Typography>
                </Container>
              ) : (
                data.data.map((item, index) => (
                  <AlarmCard key={index} data={item} onContextMenu={handleContextMenu} />
                ))
              )}
              <Fab
                variant="extended"
                sx={{ position: 'fixed', bottom: '3rem', right: '3rem', textTransform: 'none' }}
                onClick={handleOpen}
              >
                <AddIcon sx={{ mr: 1 }} /> New Alarm
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
          <DeleteOutlinedIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  )
}

export default Home

interface HoverableSidebarBoxProps {
  data: Tab
  activeTab: string
  setActiveTab: (id: string) => void
  onTabDelete: (_id: string) => void
  onTabRename: (tabName: string, newTabName: string) => void
}

const HoverableSidebarBox: React.FC<HoverableSidebarBoxProps> = ({
  data,
  activeTab,
  setActiveTab,
  onTabDelete,
  onTabRename
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [openSidebaranchorEl, setOpenSidebaranchorEl] = useState<null | HTMLElement>(null)
  const openSidebarTabMenu = Boolean(openSidebaranchorEl)

  const handleClick = (event): void => {
    setOpenSidebaranchorEl(event.currentTarget)
  }

  const handleClose = (): void => {
    setOpenSidebaranchorEl(null)
  }

  const EditTabName = (): void => {
    setRenameDialogOpen(true)
    handleClose()
  }

  const DeleteTab = async (_id: string): Promise<void> => {
    onTabDelete(_id)
    // API for deleting a tab
    await window.electron.ipcRenderer.invoke('deleteTab', _id)
    handleClose()
  }

  const tabRename = async (_id: string, newTabName: string): Promise<void> => {
    // console.log(oldTab_name, newTabName)
    // await window.electron.ipcRenderer.invoke('renameTab', oldTab_name, newTabName)
    onTabRename(_id, newTabName)
  }
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={() => console.log('contect menu')}
    >
      <Button
        variant="contained"
        startIcon={<AlarmIcon />}
        onClick={() => setActiveTab(data._id)}
        sx={{
          borderRadius: 5,
          textTransform: 'none',
          justifyContent: 'start',
          bgcolor: data._id === activeTab ? '' : 'white',
          zIndex: 3,
          width: '100%'
        }}
      >
        {data.tab_name}
      </Button>
      {isHovered && (
        <IconButton
          id="sidebarMoreIcon"
          aria-controls={openSidebarTabMenu ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openSidebarTabMenu ? 'true' : undefined}
          onClick={handleClick}
          sx={{
            color: 'black',
            position: 'absolute',
            right: 0,
            zIndex: 4
          }}
        >
          <MoreVertIcon />
        </IconButton>
      )}

      {/* Menu  */}
      <Menu
        id="basic-menu"
        open={openSidebarTabMenu}
        anchorEl={openSidebaranchorEl}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'sidebarMoreIcon'
        }}
      >
        <MenuItem onClick={EditTabName} sx={{ gap: '12px' }}>
          <EditOutlinedIcon />
          Rename
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            // todo: _rev
            DeleteTab(data._id)
          }}
          sx={{ gap: '12px' }}
        >
          <DeleteOutlinedIcon />
          Delete
        </MenuItem>
      </Menu>
      <RenameTabDialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        _id={data._id}
        oldTabName={data.tab_name}
        onRenameTab={tabRename}
      />
    </Box>
  )
}
