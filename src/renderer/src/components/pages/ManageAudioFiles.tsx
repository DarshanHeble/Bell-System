import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined'
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function ManageAudioFiles(): JSX.Element {
  const navigate = useNavigate()

  const [helpOpen, setHelpOpen] = useState(false)

  const [music_files, setMusicFiles] = useState<string[]>([])
  const [, setSelectedFile] = useState<string | null>(null)

  useEffect(() => {
    const getMusicFiles = async (): Promise<void> => {
      const result: string[] = await window.electron.ipcRenderer.invoke('get-music-files')
      setMusicFiles(result)
    }
    getMusicFiles()
  }, [])

  const handleSelectFile = async (): Promise<void> => {
    const filePath = await window.electron.ipcRenderer.invoke('select-music-file')
    if (filePath) {
      setSelectedFile(filePath)
    }
  }

  return (
    <>
      <AppBar position="relative">
        <Toolbar>
          <Tooltip title="Go back">
            <IconButton size="large" onClick={() => navigate('/')}>
              <ArrowBackOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Manage Audio Files
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Info">
              <IconButton onClick={() => setHelpOpen(true)}>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ padding: 2 }}>
        {/* {selectedFile && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Selected File:</Typography>
            <Typography variant="body2">{selectedFile}</Typography>
          </Box>
        )} */}
        <List>
          {music_files.map((file_name, index) => (
            <Box key={index}>
              <ListItem>
                <ListItemIcon>
                  <MusicNoteOutlinedIcon sx={{ fontSize: '1.5rem' }} />
                </ListItemIcon>
                <ListItemText sx={{ fontSize: '1.5rem' }}>
                  <Typography variant="h5"> {file_name}</Typography>
                </ListItemText>
                {/* <ListItemIcon>
                <IconButton>
                <DeleteOutlinedIcon />
                </IconButton>
                </ListItemIcon> */}
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>

        <Fab
          variant="extended"
          onClick={handleSelectFile}
          sx={{ position: 'absolute', right: '3rem', bottom: '3rem' }}
        >
          <UploadFileOutlinedIcon sx={{ mr: 1 }} />
          Upload File
        </Fab>
      </Container>
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
        <DialogTitle>Info</DialogTitle>
        <DialogContent>
          <ol style={{ marginLeft: '1rem' }}>
            <li>Only one audio file can be selected.</li>
            <li>Supported file formats: MP3, WAV, OGG.</li>
          </ol>
          {/* 1.Only one audio file can be selected. 2.Supported file formats: MP3, WAV, OGG. */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ManageAudioFiles
