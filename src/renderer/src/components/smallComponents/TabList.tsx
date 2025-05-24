import { FC, useState } from 'react'
import {
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@mui/material'
import { Alarm, MoreVert, EditOutlined, DeleteOutlined } from '@mui/icons-material'
import { TabWithOutTimeData } from '@shared/type'
import { updateActiveTab } from '@renderer/Apis/tab'
import { useNavigate } from 'react-router-dom'
import NameDialog from '../dialogs/NameDialog'

interface TabListProps {
  data: TabWithOutTimeData
  activeTab: string
  setActiveTab: (id: string) => void
  onTabDelete: (_id: string) => void
  onTabRename: (tabName: string, newTabName: string) => void
}

const TabList: FC<TabListProps> = ({ data, activeTab, setActiveTab, onTabDelete, onTabRename }) => {
  const navigate = useNavigate()

  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [openSidebaranchorEl, setOpenSidebaranchorEl] = useState<null | HTMLElement>(null)
  const openSidebarTabMenu = Boolean(openSidebaranchorEl)

  const handleClick = (event): void => {
    setOpenSidebaranchorEl(event.currentTarget)
  }

  const handleClose = (): void => {
    setOpenSidebaranchorEl(null)
  }

  const EditTabName = (): void => {
    setNameDialogOpen(true)
    handleClose()
  }

  const DeleteTab = async (_id: string): Promise<void> => {
    onTabDelete(_id)
    await window.electron.ipcRenderer.invoke('deleteTab', _id)
    handleClose()
  }

  const handleTabRename = async (newTabName: string): Promise<void> => {
    await window.electron.ipcRenderer.invoke('renameTab', data._id, newTabName)
    onTabRename(data._id, newTabName)
  }

  const handleActiveTab = (): void => {
    updateActiveTab(data._id, activeTab)
    setActiveTab(data._id)
    navigate(`/tabs/${data._id}`)
  }

  // console.log(activeTab)

  return (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          <IconButton
            id="sidebarMoreIcon"
            aria-controls={openSidebarTabMenu ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openSidebarTabMenu ? 'true' : undefined}
            onClick={handleClick}
            sx={{
              visibility: 'hidden',
              color: data._id === activeTab ? 'black' : 'gray'
            }}
            edge="end"
          >
            <MoreVert />
          </IconButton>
        }
        sx={{
          borderRadius: '5rem',
          bgcolor: data._id === activeTab ? 'primary.main' : '',
          '&:hover .MuiListItemSecondaryAction-root .MuiIconButton-root': {
            visibility: 'visible'
          }
        }}
      >
        <ListItemButton
          onContextMenu={handleClick}
          onClick={handleActiveTab}
          sx={{
            borderRadius: '5rem',
            color: data._id === activeTab ? 'black' : 'gray'
          }}
        >
          <ListItemIcon>
            <Alarm sx={{ color: data._id === activeTab ? 'black' : 'gray' }} />
          </ListItemIcon>
          <ListItemText>
            <Typography
              variant="subtitle2"
              sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {data.tab_name}
            </Typography>
          </ListItemText>
        </ListItemButton>
      </ListItem>
      <Menu
        id="basic-menu"
        open={openSidebarTabMenu}
        anchorEl={openSidebaranchorEl}
        onClose={handleClose}
      >
        <MenuItem onClick={EditTabName} sx={{ gap: '12px' }}>
          <EditOutlined />
          Rename
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => DeleteTab(data._id)} sx={{ gap: '12px', color: 'red' }}>
          <DeleteOutlined />
          Delete
        </MenuItem>
      </Menu>
      <NameDialog
        open={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        title="Rename the Tab"
        label="Rename"
        text={data.tab_name}
        onSubmit={handleTabRename}
      />
    </>
  )
}

export default TabList
