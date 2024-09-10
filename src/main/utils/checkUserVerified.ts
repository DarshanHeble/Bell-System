import { OtherDataType } from '@shared/type'
import { pdbOther } from '../pouchdb'

const checkUserVerified = async (): Promise<boolean> => {
  try {
    const response = await pdbOther.get<OtherDataType>('other')
    console.log('user', response)

    return response.isVerified
  } catch (error) {
    console.log('error', error)
    return false
  }
}
export default checkUserVerified
