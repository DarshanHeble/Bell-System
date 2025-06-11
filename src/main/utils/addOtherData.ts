import { pdbOther } from '../pouchdb'

const addOtherData = async (): Promise<void> => {
  try {
    await pdbOther.get('other')
    console.log('other data already exists')
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      try {
        await pdbOther.put({
          _id: 'other',
          isVerified: false,
          theme: 'system'
        })
        console.log('successfully added other data')
      } catch (error) {
        console.log(error)
      }
    }
  }
}
export default addOtherData
