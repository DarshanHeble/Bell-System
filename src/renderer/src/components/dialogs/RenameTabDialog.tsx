import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material'

interface RenameTabDialogProps {
  open: boolean
  _id: string
  oldTabName: string
  onClose: () => void
  onRenameTab: (tabName: string, newTabName: string) => void
}

const RenameTabDialog: React.FC<RenameTabDialogProps> = ({
  open,
  _id,
  oldTabName,
  onClose,
  onRenameTab
}) => {
  const [newTabName, setNewTabName] = useState(oldTabName)

  const handleRename = async (): Promise<void> => {
    if (newTabName.trim()) {
      // API for renaming tab
      await window.electron.ipcRenderer.invoke('renameTab', _id, newTabName)
      onRenameTab(_id, newTabName)
      setNewTabName('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rename Tab</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Tab Name"
          type="text"
          fullWidth
          variant="standard"
          value={newTabName}
          onChange={(e) => setNewTabName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleRename} disabled={oldTabName === newTabName.trim()}>
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RenameTabDialog
