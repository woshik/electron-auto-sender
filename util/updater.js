const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')

autoUpdater.autoDownload = false
let mainWindow

autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Found Updates',
        message: 'Found updates, do you want update now?',
        buttons: ['Sure', 'No']
    }, (buttonIndex) => {
        if (buttonIndex === 0) {
            autoUpdater.downloadUpdate()
        } else {
            mainWindow.close()
        }
    })
})

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        title: 'Install Updates',
        message: 'Updates downloaded, application will be quit for update...'
    }, () => {
        setImmediate(() => autoUpdater.quitAndInstall())
    })
})

module.exports = (focusedWindow) => {
    mainWindow = focusedWindow
    autoUpdater.setFeedURL({ 
        provider: 'github', 
        owner: 'woshik', 
        repo: 'electron-auto-sender',
        token: '5cd554b8e783af1b0d5d1ec8a95916c3df5803a3' 
    })
    autoUpdater.checkForUpdates()
}