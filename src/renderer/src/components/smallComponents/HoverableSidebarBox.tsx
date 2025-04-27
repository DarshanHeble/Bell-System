import React, { useState } from 'react'
import { Box, Button, Divider, IconButton, Menu, MenuItem } from '@mui/material'
import { Alarm, MoreVert, EditOutlined, DeleteOutlined } from '@mui/icons-material'
import { TabWithOutTimeData } from '@shared/type'
import RenameTabDialog from '../dialogs/RenameTabDialog'
import { updateActiveTab } from '@renderer/api'

interface HoverableSidebarBoxProps {
  data: TabWithOutTimeData
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
    await window.electron.ipcRenderer.invoke('deleteTab', _id)
    handleClose()
  }

  const tabRename = async (_id: string, newTabName: string): Promise<void> => {
    onTabRename(_id, newTabName)
  }

  const handleActiveTab = (): void => {
    updateActiveTab(activeTab, data._id)
    setActiveTab(data._id)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        variant="contained"
        startIcon={<Alarm />}
        onClick={handleActiveTab}
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
          <MoreVert />
        </IconButton>
      )}

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
          <EditOutlined />
          Rename
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => DeleteTab(data._id)} sx={{ gap: '12px' }}>
          <DeleteOutlined />
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

export default HoverableSidebarBox
