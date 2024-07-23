import { pdbFilePath, projectDirPath } from '@shared/constant'
import { existsSync, mkdirSync } from 'fs'
import PouchDB from 'pouchdb'

if (!existsSync(projectDirPath)) {
  mkdirSync(projectDirPath)
}
console.log(projectDirPath)

const pdb = new PouchDB(pdbFilePath)

export default pdb
