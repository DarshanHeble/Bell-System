import { OtherDataType } from '@shared/type'
import { pdbOther } from '../pouchdb'

const updateOtherData = async (updatedData: OtherDataType): Promise<boolean> => {
  try {
    const doc = await pdbOther.get<OtherDataType>('other')
    await pdbOther.put({
      ...doc,
      ...updatedData,
      _id: 'other'
    })
    return true
  } catch (error) {
    console.error('Error updating other data:', error)
    return false
  }
}

export default updateOtherData
