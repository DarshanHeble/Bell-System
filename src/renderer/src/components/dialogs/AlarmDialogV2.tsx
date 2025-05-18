import { FC, useState } from 'react'
import { CloseOutlined, LabelOutlined, MusicNoteOutlined } from '@mui/icons-material'
import {
  Autocomplete,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import { useAudio } from '@renderer/hooks/audio'
import { TimeData } from '@shared/type'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { getCurrentTime } from '@renderer/utils'

interface AlarmDialogV2Props {
  open: boolean
  activeTab: string
  title: string
  handleClose: () => void
  onTimeAdd: (_id: string, newTimeData: TimeData) => void
}

const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
const daysOfWeek = ['S', 'M', 'Tu', 'W', 'T', 'F', 'Sa']
const amPm = ['am', 'pm']

const AlarmDialogV2: FC<AlarmDialogV2Props> = ({
  open,
  title,
  handleClose
  //   onTimeAdd,
  //   activeTab
}) => {
  const { data: allMusic } = useAudio()
  const { hour, minute, period } = getCurrentTime()

  const [time, setTime] = useState({
    hour: hour.toString().padStart(2, '0'),
    minute: minute.toString().padStart(2, '0'),
    period
  })

  const [anchorEl, setAnchorEl] = useState<{ type: 'hour' | 'minute'; anchor: null | HTMLElement }>(
    {
      type: 'hour',
      anchor: null
    }
  )

  const [selectedDays, setSelectedDays] = useState<string[]>(['S', 'M', 'Tu', 'W', 'T', 'F', 'Sa'])
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const [label, setLabel] = useState('Period')

  //   only for label textfield
  const [isHovered, setIsHovered] = useState(false)
  const showClearIcon = (): void => setIsHovered(true)
  const hideClearIcon = (): void => setIsHovered(false)

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    type: 'hour' | 'minute'
  ): void => {
    setAnchorEl({ type, anchor: event.currentTarget })
  }

  const handleMenuClose = (): void => {
    setAnchorEl({ type: 'hour', anchor: null })
  }

  const handleChipClick = (day: string): void => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    )
  }

  const handleTimeUpdate = (key: 'hour' | 'minute' | 'period', value: string): void => {
    setTime((prev) => ({ ...prev, [key]: value }))
    handleMenuClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} component={'form'} onSubmit={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Time */}
          <div>
            <Container sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Chip
                variant="outlined"
                color="primary"
                label={time.hour}
                onClick={(e) => handleMenuOpen(e, 'hour')}
                sx={{ fontSize: 'xx-large', width: '5rem', height: '5rem', borderRadius: 3 }}
              />
              <Typography
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 'bold'
                }}
              >
                :
              </Typography>
              <Chip
                variant="outlined"
                color="primary"
                label={time.minute}
                onClick={(e) => handleMenuOpen(e, 'hour')}
                sx={{ fontSize: 'xx-large', width: '5rem', height: '5rem', borderRadius: 3 }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 5
                }}
              >
                {amPm.map((item) => (
                  <Chip
                    key={item}
                    // variant="outlined"
                    label={item}
                    variant={time.period === item ? 'filled' : 'outlined'}
                    color={time.period === item ? 'secondary' : 'default'}
                    onClick={() => handleTimeUpdate('period', item)}
                    sx={{
                      // fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: 'medium',
                      height: '2.3rem',
                      borderRadius: 3
                    }}
                  />
                ))}
              </div>
            </Container>
            <LocalizationProvider dateAdapter={AdapterDayjs}></LocalizationProvider>
          </div>
          {/* Label */}
          <div>
            <TextField
              fullWidth
              value={label}
              onMouseEnter={showClearIcon}
              onMouseLeave={hideClearIcon}
              margin="normal"
              label={
                <div style={{ display: 'flex' }}>
                  <LabelOutlined sx={{ mr: 1 }} /> Label
                </div>
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setLabel('')}
                        sx={{
                          visibility: isHovered ? 'visible' : 'hidden'
                        }}
                      >
                        <CloseOutlined fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>

          {/* Days */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            {daysOfWeek.map((day, index) => (
              <Chip
                key={index}
                label={day}
                variant={selectedDays.includes(day) ? 'filled' : 'outlined'}
                // color={selectedDays.includes(day) ? 'secondary' : 'primary'}
                color="primary"
                onClick={() => {
                  handleChipClick(day)
                }}
                sx={{ borderRadius: '50%', width: '2.6rem', height: '2.6rem' }}
              />
            ))}
          </div>

          {/* Music */}
          <div>
            <Autocomplete
              options={allMusic || []}
              defaultValue={allMusic?.[0]}
              getOptionLabel={(option) => option.name || ''}
              value={allMusic?.find((audio) => audio.name == selectedSound)}
              renderOption={(props, option) => (
                <li {...props} key={option.name}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  fullWidth
                  label={
                    <div style={{ display: 'flex' }}>
                      <MusicNoteOutlined sx={{ mr: 1 }} />
                      Audio
                    </div>
                  }
                />
              )}
              onChange={(_, newValue) => setSelectedSound(newValue?.name || null)}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button type="submit" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Menu anchorEl={anchorEl.anchor} open={Boolean(anchorEl.anchor)} onClose={handleMenuClose}>
        {(anchorEl.type === 'hour' ? hours : minutes).map((value) => (
          <MenuItem
            key={value}
            onClick={() => handleTimeUpdate(anchorEl.type, value)}
            sx={{ width: '5rem' }}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default AlarmDialogV2
