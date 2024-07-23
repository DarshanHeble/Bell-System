import React from 'react'
import { Box, Card, CardActionArea, CardContent, Typography, Switch } from '@mui/material'
import { TimeData } from '@shared/type'

interface AlarmCardProps {
  data: TimeData
  onContextMenu: (event: React.MouseEvent, data: TimeData) => void
}

const AlarmCard: React.FC<AlarmCardProps> = ({ data, onContextMenu }) => {
  const handleContextMenu = (event: React.MouseEvent): void => {
    event.preventDefault()
    onContextMenu(event, data)
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
      <Switch sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }} />
    </Card>
  )
}

export default AlarmCard
