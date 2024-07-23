import React from 'react'
import { MenuList, MenuItem, Paper } from '@mui/material'

type MenuData = {
  label: string
  onClick: () => void
}

type ContextMenuProps = {
  anchorPosition: { mouseX: number; mouseY: number } | null
  handleClose: () => void
  menuData: MenuData[]
}

const ContextMenu: React.FC<ContextMenuProps> = ({ anchorPosition, handleClose, menuData }) => {
  if (!anchorPosition) return null

  return (
    <Paper
      style={{
        position: 'absolute',
        top: anchorPosition.mouseY,
        left: anchorPosition.mouseX,
        zIndex: 1300
      }}
      onMouseLeave={handleClose}
    >
      <MenuList>
        {menuData.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.onClick()
              handleClose()
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuList>
    </Paper>
  )
}

export default ContextMenu
