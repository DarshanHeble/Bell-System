import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
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
  const [extension, setExtension] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          if (text && text.includes('.')) {
            const textArr = text.split('.')
            const fileExtension = textArr.pop() || ''
            const fileName = textArr.join('.')
            setName(fileName)
            setExtension(fileExtension)
          } else {
            setName(text || '')
            setExtension('')
          }
          inputRef.current.focus()
        }
      }, 200)
      return (): void => clearTimeout(timer)
    }
    return undefined
  }, [open, text])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault() // Prevents the page from reloading

    if (name.trim()) {
      const finalName = extension ? `${name.trim()}.${extension}` : name.trim()
      onSubmit(finalName)
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
            slotProps={{
              input: {
                endAdornment: extension ? (
                  <InputAdornment position="end">.{extension}</InputAdornment>
                ) : null
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" color="success" disabled={!name.trim() || name.trim() === text}>
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default NameDialog
