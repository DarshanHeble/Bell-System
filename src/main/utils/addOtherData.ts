import { pdbOther } from '../pouchdb'

const addOtherData = async (): Promise<void> => {
  try {
    await pdbOther.get('other')
    console.log('other data already exists')

    // console.log(response.ok)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.status === 404) {
      try {
        await pdbOther.put({
          _id: 'other',
          isVerified: false
        })
        console.log('successfully added other data')
      } catch (error) {
        console.log(error)
      }
    }
  }
}
export default addOtherData
