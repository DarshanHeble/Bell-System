import { Box, Button, Typography } from '@mui/material'
import { Add, FolderOpen } from '@mui/icons-material'
import NameDialog from '@renderer/components/dialogs/NameDialog'
import { useNavigate } from 'react-router-dom'
import { FC, useState } from 'react'
import { Tab, TabWithOut_Id, TabWithOutTimeData } from '@shared/type'

interface EmptyTabsProps {
  tabs: TabWithOutTimeData[]
  activeTab: string
  setTabs: React.Dispatch<React.SetStateAction<TabWithOutTimeData[]>>
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
}

const EmptyTabs: FC<EmptyTabsProps> = ({ tabs, setActiveTab }) => {
  const navigate = useNavigate()
  const [nameDialogOpen, setNameDialogOpen] = useState(false)

  const handleAddTab = async (tabName: string): Promise<void> => {
    const newTabData: TabWithOut_Id = {
      tab_id: tabName,
      tab_name: tabName,
      data: []
    }

    // API for data store
    const _id = await window.electron.ipcRenderer.invoke('addTab', newTabData)

    const finalNewTabData: Tab = {
      ...newTabData,
      _id: _id
    }

    tabs.push(finalNewTabData)

    // not needed
    // SetData((prevData) => [...prevData, newTabData])

    setActiveTab(finalNewTabData._id)
    navigate(`/tabs/${_id}`)
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // height: '100%',
          textAlign: 'center',
          flex: 1,
          p: 3,
          borderRadius: 2
        }}
      >
        <FolderOpen sx={{ fontSize: 80, color: 'gray', mb: 2 }} />
        <Typography variant="h5" color="textSecondary" sx={{ mb: 1 }}>
          No Tabs Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Create a new tab to get started!
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNameDialogOpen(true)}
          sx={{
            borderRadius: 5,
            textTransform: 'none',
            bgcolor: 'primary.main'
          }}
        >
          Create New Tab
        </Button>
      </Box>
      <NameDialog
        open={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        title="Create New Tab"
        label="Name"
        onSubmit={handleAddTab}
      />
    </>
  )
}

export default EmptyTabs
