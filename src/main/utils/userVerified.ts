import { pdbOther } from '../pouchdb'

const userVerified = async (): Promise<boolean> => {
  try {
    const response = await pdbOther.get('other').then((doc) => {
      return pdbOther.put({
        ...doc,
        isVerified: true
      })
    })
    console.log('Success', response)

    return true
  } catch (error) {
    console.log('error', error)
    return false
  }
}

export default userVerified
