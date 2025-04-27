import {
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
import {
  ArrowBackOutlined,
  DeleteOutlined,
  InfoOutlined,
  MusicNoteOutlined,
  UploadFileOutlined
} from '@mui/icons-material'

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog'
import { deleteAudioFile, renameAudioFile } from '@renderer/api'
import NameDialog from '../components/dialogs/NameDialog'

function ManageAudioFiles(): JSX.Element {
  const navigate = useNavigate()

  const [helpOpen, setHelpOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)

  const [musicFiles, setMusicFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  useEffect(() => {
    const getMusicFiles = async (): Promise<void> => {
      const result: string[] = await window.electron.ipcRenderer.invoke('get-music-files')
      setMusicFiles(result)
    }
    getMusicFiles()
  }, [])

  const handleSelectFile = async (): Promise<void> => {
    const fileName = await window.electron.ipcRenderer.invoke('select-music-file')
    // if (filePath == null) {
    //   toast.error('something went wrong')
    // }
    setMusicFiles((prev) => [...prev, fileName])
  }

  return (
    <>
      <Toaster richColors />
      <Toolbar sx={{ backgroundColor: '#202020' }}>
        <Tooltip title="Go back">
          <IconButton size="large" onClick={() => navigate('/')}>
            <ArrowBackOutlined />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" sx={{ ml: 2 }}>
          Manage Audio Files
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title="Info">
            <IconButton onClick={() => setHelpOpen(true)}>
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      <Container sx={{ padding: 2 }}>
        <List>
          {musicFiles.map((file_name, index) => (
            <Box key={index}>
              <ListItem>
                <ListItemIcon>
                  <MusicNoteOutlined sx={{ fontSize: '1.5rem' }} />
                </ListItemIcon>
                <ListItemText sx={{ fontSize: '1.5rem' }}>
                  <Typography variant="h5"> {file_name}</Typography>
                </ListItemText>
                {/* <ListItemIcon>
                  <IconButton
                    onClick={() => {
                      setSelectedFile(file_name)
                      setNameDialogOpen(true)
                    }}
                  >
                    <EditOutlined />
                  </IconButton>
                </ListItemIcon> */}
                <ListItemIcon>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setSelectedFile(file_name)
                      setConfirmationOpen(true)
                    }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </ListItemIcon>
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
          <UploadFileOutlined sx={{ mr: 1 }} />
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
      <ConfirmationDialog
        open={confirmationOpen}
        title="Delete file?"
        message={`Are you sure you want to delete this ${selectedFile} file. This action cannot be undone.`}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={async () => {
          if (!selectedFile) return
          await deleteAudioFile(selectedFile)
          setMusicFiles((prev) => prev.filter((file) => file !== selectedFile))
          setConfirmationOpen(false)
        }}
      />
      <NameDialog
        open={nameDialogOpen}
        title="Rename this file"
        label="Rename"
        text={selectedFile || ''}
        onClose={() => setNameDialogOpen(false)}
        onSubmit={async (newFileName) => {
          if (selectedFile) await renameAudioFile(selectedFile, newFileName)
          setNameDialogOpen(false)
        }}
      />
    </>
  )
}

export default ManageAudioFiles
