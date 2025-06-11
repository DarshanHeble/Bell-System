import { OtherDataType } from '@shared/type'
import { pdbOther as db } from '../../pouchdb'
import { nativeTheme } from 'electron'

const getTheme = async (): Promise<OtherDataType['theme']> => {
  try {
    const doc = await db.get<OtherDataType>('other')
    nativeTheme.themeSource = doc.theme
    return doc.theme
  } catch (error) {
    return 'system'
  }
}

export default getTheme
