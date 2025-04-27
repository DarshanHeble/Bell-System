import { useParams } from 'react-router-dom'

const BellTab = (): JSX.Element => {
  const { tabId } = useParams<{ tabId: string }>()
  return <>{tabId}</>
}

export default BellTab
