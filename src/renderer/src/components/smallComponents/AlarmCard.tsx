import React, { memo, useCallback, useEffect, useState } from 'react'
import { Box, Card, CardActionArea, CardContent, Typography, Switch } from '@mui/material'
import { TimeData } from '@shared/type'
import { daysOfWeek } from '@renderer/constants'
import { updateScheduledItem } from '@renderer/Apis/scheduler'

interface AlarmCardProps {
  data: TimeData
  tab_id: string
  onContextMenu: (event: React.MouseEvent, data: TimeData) => void
}

const AlarmCard: React.FC<AlarmCardProps> = ({ data, tab_id, onContextMenu }) => {
  // const theme = useTheme()
  const [isChecked, setIsChecked] = useState<boolean>(data.switch_state)
  const [isScheduled, setIsScheduled] = useState(false)

  const handleScheduleUpdate = useCallback(
    (_, response: TimeData | null) => {
      if (response && data.id === response.id) {
        setIsScheduled(true)
      } else {
        setIsScheduled(false)
      }
    },
    [data.id]
  )

  useEffect(() => {
    const event = window.electron.ipcRenderer.on('schedule-updated', handleScheduleUpdate)
    return (): void => {
      event()
    }
  }, [handleScheduleUpdate])

  const handleContextMenu = (event: React.MouseEvent): void => {
    event.preventDefault()
    onContextMenu(event, data)
  }

  const handleSwitchOnChange = async (): Promise<void> => {
    const newValue = !isChecked // Toggle the value of the switch
    setIsChecked(newValue) // Optimistically update the state

    try {
      // Update the backend with the new value
      await window.electron.ipcRenderer.invoke('updateSwitch', tab_id, data.id, newValue)

      // Reprocess the bell queue to account for the updated switch state
      await updateScheduledItem({
        ...data,
        switch_state: newValue
      })
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
        height: 'max-content',
        border: '1px solid transparent',
        borderColor: isScheduled ? 'primary.main' : 'transparent'
      }}
    >
      <CardActionArea
        onContextMenu={handleContextMenu}
        onClick={handleContextMenu}
        sx={{
          '& .MuiTouchRipple-ripple .MuiTouchRipple-child': {
            backgroundColor: '#656565'
            // backgroundColor: alpha(theme.palette.primary.main, 0.6)
          }
        }}
      >
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1 }}>
            <Typography color={!isChecked ? 'textDisabled' : 'textPrimary'}>
              {data.label}
            </Typography>
            <Typography color={!isChecked ? 'textDisabled' : 'textPrimary'}>
              {data.music_file_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {data.days.map((day, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  display={!day.active ? 'none' : ''}
                  color={!isChecked ? 'textDisabled' : 'textSecondary'}
                >
                  {daysOfWeek[index]}
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

export default memo(AlarmCard, (prevProps, nextProps) => {
  // Only re-render if the data or onContextMenu reference changes
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.data.time === nextProps.data.time &&
    prevProps.onContextMenu === nextProps.onContextMenu &&
    prevProps.tab_id === nextProps.tab_id
  )
})
