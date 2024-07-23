import pdb from '../pouchdb'

export const renameTab = async (_id: string, newTabName: string): Promise<void> => {
  try {
    // Get the document to retrieve the _rev field
    // const doc = await pdb.get(tabId)
    await pdb.get(_id).then(function (doc) {
      return pdb.put({
        ...doc,
        _id: _id,
        _rev: doc._rev,
        tab_name: newTabName,
        tab_id: newTabName
      })
    })
    // console.log('1', doc)

    // // Update the document with new tab name and tab id
    // const updatedDoc = {
    //   ...doc,
    //   _id: newTabId,
    //   tab_name: newTabName,
    //   tab_id: newTabId,
    //   _rev: doc._rev
    // }
    // console.log('2', updatedDoc)

    // // Save the updated document back to the database
    // await pdb.put(updatedDoc)
    // console.log('3')

    // // Remove the old document if the id has changed
    // if (tabId !== newTabId) {
    //   await pdb.remove(doc._id, doc._rev)
    // }

    console.log('Tab renamed successfully')
  } catch (error) {
    console.error('Error renaming tab:', error)
  }
}

export default renameTab
