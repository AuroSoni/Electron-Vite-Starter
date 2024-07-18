import { ElectronAPI } from '@electron-toolkit/preload'
import { Logger } from 'winston'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    logger: Logger
  }
}
