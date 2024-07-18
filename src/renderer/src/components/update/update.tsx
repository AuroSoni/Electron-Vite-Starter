import type { ProgressInfo } from 'electron-updater'
import { useCallback, useEffect, useState } from 'react'
import Modal from './modal'
import Progress from './progress'
import './update.css'

interface VersionInfo {
  update: boolean
  version: string
  newVersion?: string
}

interface ErrorType {
  message: string
  error: Error
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Update = () => {
  const [checking, setChecking] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [versionInfo, setVersionInfo] = useState<VersionInfo>()
  const [updateError, setUpdateError] = useState<ErrorType>()
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string
    okText?: string
    onCancel?: () => void
    onOk?: () => void
  }>({
    onCancel: () => setModalOpen(false),
    onOk: () => window.electron.ipcRenderer.invoke('start-download')
  })

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const checkUpdate = async () => {
    setChecking(true)
    /**
     * @type {import('electron-updater').UpdateCheckResult | null | { message: string, error: Error }}
     */
    const result = await window.electron.ipcRenderer.invoke('check-update')
    setProgressInfo({ percent: 0 })
    setChecking(false)
    setModalOpen(true)
    if (result?.error) {
      setUpdateAvailable(false)
      setUpdateError(result?.error)
    }
  }

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      setVersionInfo(arg1)
      setUpdateError(undefined)
      // Can be update
      if (arg1.update) {
        setModalBtn((state) => ({
          ...state,
          cancelText: 'Cancel',
          okText: 'Update',
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          onOk: () => window.electron.ipcRenderer.invoke('start-download')
        }))
        setUpdateAvailable(true)
      } else {
        setUpdateAvailable(false)
      }
    },
    []
  )

  const onUpdateError = useCallback((_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
    setUpdateAvailable(false)
    setUpdateError(arg1)
  }, [])

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      setProgressInfo(arg1)
    },
    []
  )

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const onUpdateDownloaded = useCallback((_event: Electron.IpcRendererEvent, ..._args: []) => {
    setProgressInfo({ percent: 100 })
    setModalBtn((state) => ({
      ...state,
      cancelText: 'Later',
      okText: 'Install now',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      onOk: () => window.electron.ipcRenderer.invoke('quit-and-install')
    }))
  }, [])

  useEffect(() => {
    // Get version information and whether to update
    const update_can_available = window.electron.ipcRenderer.on(
      'update-can-available',
      onUpdateCanAvailable
    )
    const update_error = window.electron.ipcRenderer.on('update-error', onUpdateError)
    const download_progress = window.electron.ipcRenderer.on(
      'download-progress',
      onDownloadProgress
    )
    const update_downloaded = window.electron.ipcRenderer.on(
      'update-downloaded',
      onUpdateDownloaded
    )

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return () => {
      update_can_available()
      update_error()
      download_progress()
      update_downloaded()
    }
  }, [])

  return (
    <>
      <Modal
        open={modalOpen}
        cancelText={modalBtn?.cancelText}
        okText={modalBtn?.okText}
        onCancel={modalBtn?.onCancel}
        onOk={modalBtn?.onOk}
        footer={updateAvailable ? /* hide footer */ null : undefined}
      >
        <div className="modal-slot">
          {updateError ? (
            <div>
              <p>Error downloading the latest version.</p>
              <p>{updateError.message}</p>
            </div>
          ) : updateAvailable ? (
            <div>
              <div>The last version is: v{versionInfo?.newVersion}</div>
              <div className="new-version__target">
                v{versionInfo?.version} -&gt; v{versionInfo?.newVersion}
              </div>
              <div className="update__progress">
                <div className="progress__title">Update progress:</div>
                <div className="progress__bar">
                  <Progress percent={progressInfo?.percent}></Progress>
                </div>
              </div>
            </div>
          ) : (
            <div className="can-not-available">{JSON.stringify(versionInfo ?? {}, null, 2)}</div>
          )}
        </div>
      </Modal>
      <button disabled={checking} onClick={checkUpdate}>
        {checking ? 'Checking...' : 'Check update'}
      </button>
    </>
  )
}

export default Update
