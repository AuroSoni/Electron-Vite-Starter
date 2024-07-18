import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import logger from './logger'

// Custom APIs for renderer
const api = {}
// Log the logger methods to verify
// console.log('logger methods:', Object.keys(logger))
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  console.log('context isolation enabled')
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('logger', {
      log: (level: string, message: string) => logger.log(level, message),
      info: (message: string) => logger.info(message),
      warn: (message: string) => logger.warn(message),
      error: (message: string) => logger.error(message),
      debug: (message: string) => logger.debug(message)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  console.log('context isolation disabled')
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.logger = logger
}
