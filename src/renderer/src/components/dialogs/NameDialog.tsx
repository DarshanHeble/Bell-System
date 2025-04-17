import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material'
import { FC, useEffect, useRef, useState } from 'react'

interface NameDialogProps {
  open: boolean
  text?: string
  title: string
  label: string
  onSubmit: (name: string) => void
  onClose: () => void
}

const NameDialog: FC<NameDialogProps> = ({ open, title, text, label, onClose, onSubmit }) => {
  const [name, setName] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          setName(text || '')
        }
      }, 200)
      return (): void => clearTimeout(timer)
    }
  }, [open, text])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault() // Prevents the page from reloading

    if (name.trim()) {
      onSubmit(name.trim())
    }

    handleClose()
  }

  function handleClose(): void {
    setName('')
    onClose()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={inputRef}
            value={name}
            type="text"
            name={label}
            label={label}
            onChange={handleNameChange}
            
            sx={{ marginBlockStart: 2 }}
            fullWidth
            autoFocus
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" color="success">
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default NameDialog
