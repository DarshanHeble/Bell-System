import { useParams } from 'react-router-dom'
import { Box, Fab, Grid, LinearProgress, Menu, MenuItem } from '@mui/material'
import NoBells from '@renderer/components/smallComponents/NoBells'
import AlarmCard from '@renderer/components/smallComponents/AlarmCard'
import { TimeData } from '@shared/type'
import { useState } from 'react'
import { Add, DeleteOutlined } from '@mui/icons-material'
import AlarmDialog from '@renderer/components/dialogs/AlarmDialog'
import { useAddBell, useBells } from '@renderer/hooks/bells'

const BellTab = (): JSX.Element => {
  const { tabId } = useParams<{ tabId: string }>()
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)

  const [cardContextMenu, setCardContextMenu] = useState<{
    mouseX: number
    mouseY: number
    data: TimeData
  } | null>(null)

  const handleContextMenu = (event: React.MouseEvent, timeData: TimeData): void => {
    event.preventDefault()

    setCardContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      data: timeData
    })
  }

  if (!tabId) {
    return <>No ID found</>
  }

  const { data: bells, isLoading: isBellsLoading, isFetching: isBellsFetching } = useBells(tabId)
  const { mutate: addBell } = useAddBell(tabId)

  function handleTimeAdd(tabId: string, newTimeData: TimeData): void {
    if (!tabId) return
    addBell(newTimeData)
  }

  if (bells === undefined) {
    return <>No ID found</>
  }

  if (bells.data.length === 0) {
    return (
      <>
        <NoBells />
        <Fab
          variant="extended"
          sx={{ position: 'fixed', bottom: '3rem', right: '3rem', textTransform: 'none' }}
          onClick={handleOpen}
        >
          <Add sx={{ mr: 1 }} /> New Alarm
        </Fab>
      </>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      {isBellsLoading || (isBellsFetching && <LinearProgress />)}
      <Box sx={{ p: 3 }}>
        <Grid spacing={2} container>
          {bells.data.map((bell) => (
            <Grid key={bell.id} size={4}>
              <AlarmCard data={bell} tab_id={bells._id} onContextMenu={handleContextMenu} />
            </Grid>
          ))}
        </Grid>
        <Fab
          variant="extended"
          sx={{ position: 'fixed', bottom: '3rem', right: '3rem', textTransform: 'none' }}
          onClick={handleOpen}
        >
          <Add sx={{ mr: 1 }} /> New Alarm
        </Fab>

        <AlarmDialog
          open={open}
          handleClose={handleClose}
          onTimeAdd={handleTimeAdd}
          activeTab={tabId || ''}
        />
        <Menu
          id="cardMenu"
          open={cardContextMenu !== null}
          onClose={() => setCardContextMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={
            cardContextMenu !== null
              ? { top: cardContextMenu.mouseY, left: cardContextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem>
            <DeleteOutlined sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>
    </div>
  )
}

export default BellTab
