import React, { useState } from 'react'
import { Box, Card, CardActionArea, CardContent, Typography, Switch } from '@mui/material'
import { TimeData } from '@shared/type'

interface AlarmCardProps {
  data: TimeData
  dataIndex: number
  tab_id: string
  onContextMenu: (event: React.MouseEvent, data: TimeData) => void
}

const AlarmCard: React.FC<AlarmCardProps> = ({ data, dataIndex, tab_id, onContextMenu }) => {
  const [isChecked, setIsChecked] = useState<boolean>(data.switch_state)

  const handleContextMenu = (event: React.MouseEvent): void => {
    event.preventDefault()
    onContextMenu(event, data)
  }

  const handleSwitchOnChange = (): void => {
    setIsChecked((prevValue) => {
      const newValue = !prevValue
      console.log(newValue)

      window.electron.ipcRenderer.invoke('updateSwitch', tab_id, dataIndex, newValue)
      return newValue
    })
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
            <Typography variant="h3" component="h2" sx={{ fontSize: '3.5rem' }}>
              {data.time.hour}:{data.time.minute.toString().padStart(2, '0')}
            </Typography>
            <Typography variant="h5" sx={{ ml: 1 }}>
              {data.time.period}
            </Typography>
          </Box>
          <Box>
            <Typography>{data.label}</Typography>
            <Typography>{data.music_file_name}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {data.days.map((day, index) => (
                <Typography key={index}>{day.day}</Typography>
              ))}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      <Switch
        sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
        checked={isChecked}
        onChange={handleSwitchOnChange}
      />
    </Card>
  )
}

export default AlarmCard
