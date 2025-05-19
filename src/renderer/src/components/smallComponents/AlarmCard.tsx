import React, { useState } from 'react'
import { Box, Card, CardActionArea, CardContent, Typography, Switch } from '@mui/material'
import { TimeData } from '@shared/type'
import { processNextBell } from '@renderer/bellQueue'

interface AlarmCardProps {
  data: TimeData
  tab_id: string
  onContextMenu: (event: React.MouseEvent, data: TimeData) => void
}

const AlarmCard: React.FC<AlarmCardProps> = ({ data, tab_id, onContextMenu }) => {
  const [isChecked, setIsChecked] = useState<boolean>(data.switch_state)

  const handleContextMenu = (event: React.MouseEvent): void => {
    event.preventDefault()
    onContextMenu(event, data)
  }

  const handleSwitchOnChange = async (): Promise<void> => {
    const newValue = !isChecked // Toggle the value of the switch
    setIsChecked(newValue) // Optimistically update the state

    try {
      // console.log(`Switch state updated to: ${newValue}`)

      // Update the backend with the new value
      await window.electron.ipcRenderer.invoke('updateSwitch', tab_id, data.id, newValue)

      // Reprocess the bell queue to account for the updated switch state
      await processNextBell()
    } catch (error) {
      console.error('Error updating switch state:', error)

      // Revert the state if the backend update fails
      setIsChecked(!newValue)
    }
  }

  return (
    <Card
      sx={{
        position: 'relative',
        height: 'max-content'
      }}
    >
      <CardActionArea onContextMenu={handleContextMenu} onClick={handleContextMenu}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'baseline' }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontSize: '3.5rem' }}
              color={!isChecked ? 'textDisabled' : 'textPrimary'}
            >
              {data.time.hour}:{data.time.minute.toString().padStart(2, '0')}
            </Typography>
            <Typography
              variant="h5"
              sx={{ ml: 1 }}
              color={!isChecked ? 'textDisabled' : 'textPrimary'}
            >
              {data.time.period}
            </Typography>
          </Box>
          <Box>
            <Typography color={!isChecked ? 'textDisabled' : 'textPrimary'}>
              {data.label}
            </Typography>
            <Typography color={!isChecked ? 'textDisabled' : 'textPrimary'}>
              {data.music_file_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {data.days.map((day, index) => (
                <Typography key={index} color={!isChecked ? 'textDisabled' : 'textSecondary'}>
                  {day.day}
                </Typography>
              ))}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      <Switch
        sx={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}
        checked={isChecked}
        onChange={handleSwitchOnChange}
      />
    </Card>
  )
}

export default AlarmCard
