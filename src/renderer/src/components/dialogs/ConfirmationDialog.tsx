import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { FC } from 'react'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  message: string
  onClose: () => void
  onConfirm: () => void
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
