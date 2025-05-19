import { NotificationsOffRounded } from '@mui/icons-material'
import { Container, Typography } from '@mui/material'
// import { FC } from 'react'

// interface NoBellsProps {
//   tabName: string
// }

const NoBells = (): JSX.Element => {
  return (
    <Container
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Typography
        variant="h3"
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        No bells
        <NotificationsOffRounded sx={{ fontSize: '4rem', color: 'gold' }} />
        to show.
      </Typography>
    </Container>
  )
}

export default NoBells
