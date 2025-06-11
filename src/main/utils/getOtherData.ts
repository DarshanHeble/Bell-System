import { OtherDataType } from '@shared/type'
import { pdbOther } from '../pouchdb'

export const getOtherData = async (): Promise<OtherDataType> => {
  try {
    const response = await pdbOther.get<OtherDataType>('other')
    return response
  } catch (error) {
    console.error('Error creating default other data:', error)
    throw error
  }
}
