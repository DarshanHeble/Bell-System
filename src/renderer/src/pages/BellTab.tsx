import { useParams } from 'react-router-dom'
import { Box, Fab, Grid, LinearProgress, Menu, MenuItem } from '@mui/material'
import NoBells from '@renderer/components/smallComponents/NoBells'
import AlarmCard from '@renderer/components/smallComponents/AlarmCard'
import { TimeData } from '@shared/type'
import { useEffect, useState } from 'react'
import { Add, DeleteOutlined } from '@mui/icons-material'
import AlarmDialog from '@renderer/components/dialogs/AlarmDialog'
import { useAddBell, useBells, useDeleteBell } from '@renderer/hooks/bells'
import { addToQueue, bellQueue, processNextBell } from '@shared/bellQueue'

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
  const { mutate: deleteBell } = useDeleteBell(tabId)

  if (!isBellsLoading) {
    console.log('Bells:', bells)
  }

  useEffect(() => {
    const initializeQueue = async (): Promise<void> => {
      if (bells) {
        // Populate the queue with fetched data
        await addToQueue(bells.data)
        await processNextBell() // Ensure queue processing is completed before moving on
      }
    }

    initializeQueue()
  }, [bells])

  async function handleTimeAdd(tabId: string, newTimeData: TimeData): Promise<void> {
    if (!tabId) return
    addBell(newTimeData)
    bellQueue.add(newTimeData)
    await processNextBell()
  }

  async function handleTimeDelete(): Promise<void> {
    if (cardContextMenu) {
      deleteBell(cardContextMenu.data)
      setCardContextMenu(null)
      bellQueue.remove(cardContextMenu.data)
      await processNextBell()
    }
  }

  if (bells === undefined) {
    return <>No ID found</>
  }

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      {isBellsLoading || (isBellsFetching && <LinearProgress />)}

      <Box sx={{ p: 3, flex: 1 }}>
        {/* Handle when no bell */}
        {bells.data.length === 0 && <NoBells />}

        {/* Handle when bell */}
        <Grid spacing={2} container>
          {bells.data.map((bell, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
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
          <MenuItem onClick={handleTimeDelete}>
            <DeleteOutlined sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>
    </div>
  )
}

export default BellTab
