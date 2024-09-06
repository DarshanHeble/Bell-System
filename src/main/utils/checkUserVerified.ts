import { OtherDataType } from '@shared/type'
import { pdbOther } from '../pouchdb'

const checkUserVerified = async (): Promise<boolean> => {
  try {
    const response = await pdbOther.get<OtherDataType>('other')
    console.log('user', response)

    if (response.isVerified) {
      return true
    }

    return false
  } catch (error) {
    console.log('error', error)
    return false
  }
}
export default checkUserVerified
