import pdb from '../pouchdb'

const deleteTab = async (_id: string): Promise<void> => {
  try {
    // TODO: need to upgrade ._rev
    // Get the document to retrieve the _rev field
    const doc = await pdb.get(_id)

    // Delete the document using _id and _rev
    await pdb.remove(doc._id, doc._rev)

    console.log('Tab deleted successfully')
  } catch (error) {
    console.error('Error deleting tab:', error)
  }
}

export default deleteTab
