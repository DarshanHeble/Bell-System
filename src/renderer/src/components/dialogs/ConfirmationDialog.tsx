import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { FC, useEffect, useRef } from 'react'

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
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      btnRef.current?.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button ref={btnRef} color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
