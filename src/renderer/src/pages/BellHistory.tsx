import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { Day, Tab, TimeData } from '@shared/type'

type History = {
  id: string
  tabId: Tab['_id']
  tabName: Tab['tab_name']
  time: TimeData['time']
  day: Day['day']

  status: boolean
  errorInfo?: string
}

const head = ['#', 'Tab Name', 'Time', 'Status', 'Error Info']

const BellHistory = (): JSX.Element => {
  return (
    <Container sx={{ display: 'flex', flex: 1, py: 2 }}>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {head.map((item, index) => (
                <TableCell key={index} variant="head">
                  {item}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.tabName}</TableCell>
                <TableCell>
                  {item.time.hour}:{item.time.minute} {item.time.period}
                </TableCell>
                <TableCell sx={{ color: item.status ? 'success.main' : 'error.main' }}>
                  {item.status ? 'Success' : 'Failed'}
                </TableCell>
                <TableCell>{item.errorInfo || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}

export default BellHistory

const history = [
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: false,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: false,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: false,
    errorInfo: 'error'
  },
  {
    id: '1',
    tabId: 't1',
    tabName: 'classes',
    time: {
      hour: 3,
      minute: 20,
      period: 'am'
    },
    day: 'Monday',

    status: true,
    errorInfo: 'error'
  }
] satisfies History[]
