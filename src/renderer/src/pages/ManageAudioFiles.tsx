import { useState } from 'react'
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
  DeleteOutlined,
  InfoOutlined,
  MusicNoteOutlined,
  UploadFileOutlined
} from '@mui/icons-material'

import { toast } from 'sonner'
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog'
import { deleteAudioFile, renameAudioFile } from '@renderer/Apis/audio'
import NameDialog from '../components/dialogs/NameDialog'
import { AudioFile } from '@shared/type'
import { useAudio } from '@renderer/hooks/audio'

function ManageAudioFiles(): JSX.Element {
  const [helpOpen, setHelpOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)

  // const [musicFiles, setMusicFiles] = useState<AudioFile[]>([])
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null)

  const { data: musicFiles, refetch: refetchMusicFiles } = useAudio()

  const handleSelectFile = async (): Promise<void> => {
    await window.electron.ipcRenderer
      .invoke('select-music-file')
      .then((fileName: string) => {
        refetchMusicFiles()
        if (fileName == 'cancel') toast.info('User Cancelled the Operation')
        else if (fileName == 'duplicate') toast.info('File with Name Already Exists ')
        else toast.success('Audio Added Successfully')
      })
      .catch((error) => {
        toast.error(error.message || 'Something went wrong')
      })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar>
        {/* <Tooltip title="Go back">
          <IconButton size="large" onClick={() => navigate('/')}>
            <ArrowBackOutlined />
          </IconButton>
        </Tooltip> */}
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
      <Divider />
      <Container sx={{ padding: 2 }}>
        <List>
          {musicFiles?.map((file, index) => (
            <Box key={index}>
              <ListItem>
                <ListItemIcon>
                  <MusicNoteOutlined sx={{ fontSize: '1.5rem' }} />
                </ListItemIcon>
                <ListItemText sx={{ fontSize: '1.5rem' }}>
                  <Typography variant="h5"> {file.name}</Typography>
                </ListItemText>
                <div className="audio-player">
                  <audio controls>
                    <source src={file.path} type="audio/mp3" />
                    Audio is not supported
                  </audio>
                </div>
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
                      setSelectedFile(file)
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
        message={`Are you sure you want to delete this ${selectedFile?.name} file. This action cannot be undone.`}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={async () => {
          if (!selectedFile) return
          await deleteAudioFile(selectedFile.name)
          // setMusicFiles((prev) => prev.filter((file) => file !== selectedFile))
          refetchMusicFiles()
          setConfirmationOpen(false)
        }}
      />

      <NameDialog
        open={nameDialogOpen}
        title="Rename this file"
        label="Rename"
        text={selectedFile?.name || ''}
        onClose={() => setNameDialogOpen(false)}
        onSubmit={async (newFileName) => {
          if (selectedFile) await renameAudioFile(selectedFile.name, newFileName)
          setNameDialogOpen(false)
        }}
      />
    </div>
  )
}

export default ManageAudioFiles
