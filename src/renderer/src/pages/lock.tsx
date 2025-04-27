import { useState } from 'react'
import { TextField, Button, Box, Typography, Paper } from '@mui/material'
import { toast, Toaster } from 'sonner'
import { APP_PASSWORD } from '@shared/password'

interface LockProps {
  setVerified: (isVerified: boolean) => void
}

export default function Lock({ setVerified }: LockProps): JSX.Element {
  const [inputPassword, setInputPassword] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  const handleUnlock = async (): Promise<void> => {
    if (inputPassword === APP_PASSWORD) {
      const response = await window.electron.ipcRenderer.invoke('userIsVerified')
      if (!response) {
        toast.error('An Error has occurred while updating the database')
      }
      toast.success('Password Verified')
      setTimeout(() => {
        setVerified(true) // Update state in parent component
      }, 1000)
    } else {
      setError(true)
    }
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="#0e0e0e"
        padding={2}
      >
        <Paper elevation={3} style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Password Verification
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="Enter Password"
            variant="outlined"
            value={inputPassword}
            onChange={(e) => {
              setInputPassword(e.target.value)
              setError(false)
            }}
            error={error}
            helperText={error ? 'Incorrect password. Please try again.' : ''}
            margin="normal"
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleUnlock}
            style={{ marginTop: '20px' }}
          >
            Verify
          </Button>
        </Paper>
      </Box>
      <Toaster richColors />
    </>
  )
}
