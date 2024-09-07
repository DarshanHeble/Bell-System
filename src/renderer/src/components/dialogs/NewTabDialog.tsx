import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box
} from '@mui/material'
import { Tab, TabWithOut_Id } from '@shared/type'

interface NewTabDialogProps {
  open: boolean
  onClose: () => void
  onAddTab: (newTabData: Tab) => void
}

const NewTabDialog: React.FC<NewTabDialogProps> = ({ open, onClose, onAddTab }) => {
  const [newTabName, setNewTabName] = useState('')

  const handleAdd = async (): Promise<void> => {
    const trimmedNewTabName = newTabName.trim()
    if (trimmedNewTabName) {
      const newTabDataWithOut_Id: TabWithOut_Id = {
        tab_id: trimmedNewTabName,
        tab_name: trimmedNewTabName,
        data: []
      }

      // API to add new tab get _id back
      const _id: string = await window.electron.ipcRenderer.invoke('addTab', newTabDataWithOut_Id)

      const finalNewTabData = {
        ...newTabDataWithOut_Id,
        _id: _id
      }

      onAddTab(finalNewTabData)
      setNewTabName('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ bgcolor: '#1f1f1f' }}>
        <DialogTitle>Add New Tab</DialogTitle>
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
          <Button onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default NewTabDialog
