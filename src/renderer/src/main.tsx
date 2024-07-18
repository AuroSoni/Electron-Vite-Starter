import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

console.log('window.electron.ipcRenderer:', window.electron.ipcRenderer)
window.logger.info('Starting the Renderer')

// Override console methods to log to Winston
console.log = (...args): unknown => window.logger.info(args.join(' '))
console.error = (...args): unknown => window.logger.error(args.join(' '))
console.warn = (...args): unknown => window.logger.warn(args.join(' '))
console.info = (...args): unknown => window.logger.info(args.join(' '))
console.debug = (...args): unknown => window.logger.debug(args.join(' '))

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
