import { FC, useEffect, useState } from 'react'
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
import { getCurrentTime } from '@renderer/utils'
import { v4 } from 'uuid'
import { daysOfWeek, fullDayNames } from '@renderer/constants'

interface AlarmDialogV2Props {
  open: boolean
  activeTab: string
  title: string
  timeLength: number
  handleClose: () => void
  onTimeAdd: (_id: string, newTimeData: TimeData) => void
}

const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
const amPm = ['am', 'pm']

const AlarmDialogV2: FC<AlarmDialogV2Props> = ({
  open,
  title,
  timeLength,
  handleClose,
  onTimeAdd,
  activeTab
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

  const [selectedDays, setSelectedDays] = useState<string[]>(['M', 'Tu', 'W', 'T', 'F', 'Sa'])
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const [label, setLabel] = useState<string | null>(null)

  //   only for label textfield
  const [isHovered, setIsHovered] = useState(false)
  const showClearIcon = (): void => setIsHovered(true)
  const hideClearIcon = (): void => setIsHovered(false)

  useEffect(() => {
    if (open) {
      // When the dialog is open and music data is available
      if (allMusic && allMusic.length > 0) {
        setLabel(`Period ${timeLength + 1}`)
        // If no sound is currently selected (e.g., initial state or after reset)
        if (selectedSound === null) {
          setSelectedSound(allMusic[0].name)
        }
      } else if (selectedSound !== null) {
        // If dialog is open but no music is available, ensure selectedSound is null
        setSelectedSound(null)
      }
    } else {
      // When the dialog closes, reset selectedSound to null for the next opening
      if (selectedSound !== null) {
        setSelectedSound(null)
        // set label to null
        setLabel(null)
      }
    }
  }, [open, allMusic, selectedSound])

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

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>, type: 'hour' | 'minute'): void => {
    const change = e.deltaY < 0 ? 1 : -1
    setTime((prev) => {
      const newValue =
        type === 'hour'
          ? (Number(prev.hour) + change + 12) % 12 || 12
          : (Number(prev.minute) + change + 60) % 60
      return {
        ...prev,
        [type]: newValue.toString().padStart(2, '0')
      }
    })
  }

  const handleSave = (): void => {
    const newData: TimeData = {
      id: v4(),
      time: { hour: Number(time.hour), minute: Number(time.minute), period: time.period },
      label: label || 'period',
      music_file_name: selectedSound || '',
      days: daysOfWeek.map((uiDay, index) => ({
        day: fullDayNames[index],
        active: selectedDays.includes(uiDay)
      })),
      switch_state: true
    }

    onTimeAdd(activeTab, newData)
    handleClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} component={'form'} onSubmit={handleSave}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Time */}

          <Container sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Chip
              variant="outlined"
              color="primary"
              label={time.hour}
              onClick={(e) => handleMenuOpen(e, 'hour')}
              onWheel={(e) => handleScroll(e, 'hour')}
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
              onClick={(e) => handleMenuOpen(e, 'minute')}
              onWheel={(e) => handleScroll(e, 'minute')}
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
                    textTransform: 'none',
                    fontSize: 'medium',
                    height: '2.3rem',
                    borderRadius: 3
                  }}
                />
              ))}
            </div>
          </Container>

          {/* Label */}
          <div>
            <TextField
              fullWidth
              value={label || ''}
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

          {/* Music */}
          <div>
            <Autocomplete
              options={allMusic || []}
              getOptionLabel={(option) => option.name || ''}
              value={allMusic?.find((audio) => audio.name == selectedSound) || null}
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

          {/* Days */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            {daysOfWeek.map((day, index) => (
              <Chip
                key={index}
                label={day}
                variant={selectedDays.includes(day) ? 'filled' : 'outlined'}
                color="primary"
                onClick={() => {
                  handleChipClick(day)
                }}
                sx={{ borderRadius: '50%', width: '2.6rem', height: '2.6rem' }}
              />
            ))}
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
