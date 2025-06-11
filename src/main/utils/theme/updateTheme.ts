import { OtherDataType } from '@shared/type'
import { pdbOther as db } from '../../pouchdb'
import { nativeTheme } from 'electron'

const updateTheme = async (updatedTheme: OtherDataType['theme']): Promise<boolean> => {
  try {
    const doc = await db.get<OtherDataType>('other')
    console.log('Updating theme settings:', updatedTheme)

    nativeTheme.themeSource = updatedTheme
    await db.put({
      ...doc,
      theme: updatedTheme
    })
    return true
  } catch (error) {
    console.error('Error updating theme settings:', error)
    return false
  }
}

export default updateTheme
