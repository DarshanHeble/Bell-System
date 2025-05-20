import { app } from 'electron'
import path from 'path'

export const appDirName = 'BellSystem'
export const pBellDbName = 'bellData'
export const pOtherDbName = 'OtherData'
export const appMusicDirName = 'BellSystem'

// path to the user folder in user device
export const userDataPath = app.getPath('userData')

// path to the app data folder
export const projectDirPath = path.join(userDataPath, appDirName)

// path to the project Bell data base
export const pdbBellFilePath = path.join(projectDirPath, pBellDbName)

// path to the other data of the project
export const pdbOtherFilePath = path.join(projectDirPath, pOtherDbName)

// path to the user music directory
export const userMusicDirPath = app.getPath('music')

// path to the app music directory
export const projectMusicDirPath = path.join(userMusicDirPath, appMusicDirName)

export const AUDIO_EXTENSIONS_REGEX = /\.(mp3|wav|ogg)$/i
export const CUSTOM_PROTOCOL_SCHEME = 'myaudio'
