import { pdbBellFilePath, projectDirPath, pdbOtherFilePath } from '@shared/constant'
import { existsSync, mkdirSync } from 'fs'
import PouchDB from 'pouchdb'

if (!existsSync(projectDirPath)) {
  mkdirSync(projectDirPath)
}
console.log(projectDirPath)

export const pdbBell = new PouchDB(pdbBellFilePath)

export const pdbOther = new PouchDB(pdbOtherFilePath)
console.log(pdbOtherFilePath)
