import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  FormControl,
  Chip,
  Autocomplete,
  TextField
} from '@mui/material'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined'

import { getCurrentTime } from '@renderer/utils'
import { TimeData } from '@shared/type'

interface AddAlarmDialogProps {
  open: boolean
  handleClose: () => void
  onTimeAdd: (_id: string, newTimeData: TimeData) => void
  activeTab: string
}

const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
const amPm = ['am', 'pm']
const daysOfWeek = ['S', 'M', 'Tu', 'W', 'T', 'F', 'Sa']
// const allSounds: string[] = []

const AlarmDialog: React.FC<AddAlarmDialogProps> = ({
  open,
  handleClose,
  onTimeAdd,
  activeTab
}) => {
  const [allMusic, setAllMusic] = useState<string[]>([])

  useEffect(() => {
    const getMusicFiles = async (): Promise<void> => {
      const result: string[] = await window.electron.ipcRenderer.invoke('get-music-files')
      setAllMusic(result)
    }
    getMusicFiles()
  }, [])

  useEffect(() => {
    if (allMusic.length > 0) {
      setSelectedSound(allMusic[0])
    }
  }, [allMusic])

  const { hour, minute, period } = getCurrentTime()

  const [anchorElHour, setAnchorElHour] = useState(null)
  const [anchorElMinute, setAnchorElMinute] = useState(null)

  const [hrBtnText, setHrBtnText] = useState(hour.toString().padStart(2, '0'))
  const [minBtnText, setMinBtnText] = useState(minute.toString().padStart(2, '0'))
  const [activeAmPm, setActiveAmPm] = useState<'am' | 'pm'>(period)
  const [label, setLabel] = useState('Period')
  const [selectedDays, setSelectedDays] = useState<string[]>(['S', 'M', 'Tu', 'W', 'T', 'F', 'Sa'])
  const [selectedSound, setSelectedSound] = useState<string | null>(null)

  const handleHourClick = (event): void => {
    setAnchorElHour(event.currentTarget)
  }

  const handleMinuteClick = (event): void => {
    setAnchorElMinute(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorElHour(null)
    setAnchorElMinute(null)
  }

  const handleHourSelect = (hour): void => {
    setHrBtnText(hour)
    handleMenuClose()
  }

  const handleMinuteSelect = (minute): void => {
    setMinBtnText(minute)
    handleMenuClose()
  }

  const handleAmPmClick = (item): void => {
    setActiveAmPm(item)
  }
  const handleChipClick = (day: string): void => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    )
  }
  const handleScroll = (e: React.WheelEvent<HTMLButtonElement>, type: 'hour' | 'minute'): void => {
    // e.preventDefault() // Prevent default scroll behavior

    const change = e.deltaY < 0 ? 1 : -1 // Scroll up or down
    console.log(change)

    if (type === 'hour') {
      setHrBtnText((prevHour) => {
        const newHour = Number(prevHour) + change
        if (newHour === 0) {
          return '12'
        } else if (newHour === 13) {
          return '01'
        }
        return newHour.toString().padStart(2, '0')
      })
    } else if (type === 'minute') {
      setMinBtnText((prevMin) => {
        const newMin = Number(prevMin) + change
        if (newMin === -1) {
          return '60'
        } else if (newMin === 60) {
          return '00'
        }
        return newMin.toString().padStart(2, '0')
      })
    }
  }

  const handleSave = (): void => {
    console.log(hrBtnText, minBtnText, activeAmPm, selectedDays, selectedSound)

    const newData: TimeData = {
      time: { hour: Number(hrBtnText), minute: Number(minBtnText), period: activeAmPm },
      label: label,
      music_file_name: selectedSound ? selectedSound : '',
      days: daysOfWeek.map((day) => ({
        day,
        active: selectedDays.includes(day)
      })),
      switch_state: true
    }

    // const tabIndex = timedata.findIndex((tab) => tab.tab_id === activeTab)

    // if (tabIndex == -1) {
    //   console.error('index not found')
    // } else {
    //   timedata[tabIndex].data.push(newData)
    //   timedata[tabIndex].data.sort()
    // }

    onTimeAdd(activeTab, newData)

    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <Box sx={{ bgcolor: '#1f1f1f' }}>
        <DialogTitle>Add New Alarm</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          {/* time */}
          <Box
            className="buttons"
            sx={{ width: '100%', display: 'flex', gap: 1, justifyContent: 'center' }}
          >
            <Box className="number" sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleHourClick}
                onWheel={(e) => {
                  // console.log('Hour scroll', e),
                  handleScroll(e, 'hour')
                }}
                sx={{ fontSize: 'xx-large', width: '5rem', height: '5rem' }}
              >
                {hrBtnText}
              </Button>
              <Typography
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 'bold'
                }}
              >
                :
              </Typography>
              <Button
                variant="contained"
                onClick={handleMinuteClick}
                onWheel={(e) => {
                  // console.log('Minute scroll', e)
                  handleScroll(e, 'minute')
                }}
                sx={{ fontSize: 'xx-large', width: '5rem', height: '5rem' }}
              >
                {minBtnText}
              </Button>
              <Menu anchorEl={anchorElHour} open={Boolean(anchorElHour)} onClose={handleMenuClose}>
                {hours.map((hour) => (
                  <MenuItem
                    key={hour}
                    onClick={() => handleHourSelect(hour)}
                    sx={{ width: '5rem' }}
                  >
                    {hour}
                  </MenuItem>
                ))}
              </Menu>
              <Menu
                anchorEl={anchorElMinute}
                open={Boolean(anchorElMinute)}
                onClose={handleMenuClose}
              >
                {minutes.map((minute) => (
                  <MenuItem
                    key={minute}
                    onClick={() => handleMinuteSelect(minute)}
                    sx={{ width: '5rem' }}
                  >
                    {minute}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box className="ampm" sx={{ display: 'grid', placeItems: 'center', gap: 0.5 }}>
              {amPm.map((item) => (
                <Button
                  key={item}
                  variant="contained"
                  color={activeAmPm == item ? 'secondary' : 'primary'}
                  className={item === activeAmPm ? 'active' : ''}
                  onClick={() => handleAmPmClick(item)}
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: 'large',
                    height: '2.3rem'
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
          </Box>
          {/* label */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              gap: '1.5rem'
            }}
          >
            <LabelOutlinedIcon />
            <FormControl variant="standard" sx={{ width: '100%' }}>
              {/* /          <InputLabel htmlFor="input-with-icon-adornment">With a start adornment</InputLabel> */}
              <TextField
                fullWidth
                variant="standard"
                value={label}
                id="input-with-icon-adornment"
                sx={{ height: '3rem', fontSize: 'large' }}
                onChange={(event) => setLabel(event.target.value)}
              />
            </FormControl>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1
            }}
          >
            {daysOfWeek.map((day, index) => (
              <Chip
                key={index}
                label={day}
                variant={selectedDays.includes(day) ? 'filled' : 'outlined'}
                color={selectedDays.includes(day) ? 'secondary' : 'primary'}
                onClick={() => {
                  handleChipClick(day)
                }}
                sx={{ borderRadius: '50%', width: '2.6rem', height: '2.6rem' }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              gap: '1.5rem'
            }}
          >
            <MusicNoteOutlinedIcon />
            <Autocomplete
              options={allMusic}
              value={selectedSound}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  sx={{ height: '3rem', fontSize: 'large' }}
                />
              )}
              onChange={(_, newValue) => setSelectedSound(newValue)}
              sx={{ width: '100%' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Close
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AlarmDialog
