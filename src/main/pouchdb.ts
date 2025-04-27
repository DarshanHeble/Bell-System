import { pdbBellFilePath, projectDirPath, pdbOtherFilePath } from '@shared/constant'
import { existsSync, mkdirSync } from 'fs'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find' // Import the pouchdb-find plugin

PouchDB.plugin(PouchDBFind) // Add the plugin

if (!existsSync(projectDirPath)) {
  mkdirSync(projectDirPath)
}
console.log(projectDirPath)

export const pdbBell = new PouchDB(pdbBellFilePath)

export const pdbOther = new PouchDB(pdbOtherFilePath)
console.log(pdbOtherFilePath)

// Function to create necessary indexes
async function initializeDatabase(): Promise<void> {
  try {
    // Create index for `pdbBell`
    await pdbBell.createIndex({
      index: {
        fields: ['tab_name', 'tab_id', 'isActive', '_id', '_rev'] // Fields commonly queried
      }
    })
    console.log('Index created for pdbBell')
  } catch (error) {
    console.error('Error creating indexes:', error)
  }
}
initializeDatabase()
