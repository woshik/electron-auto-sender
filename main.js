const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const auth = require(path.join(__dirname, 'util', 'auth'))
const logger = require(path.join(__dirname, 'util', 'logging'))(app)

let mainWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        minWidth: 1000,
        minHeight: 750,
        show: false,
        icon: path.join(__dirname, 'static', 'icon', 'icon.ico'),
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile(path.join(__dirname, 'views', 'login.html'))

    mainWindow.setMenuBarVisibility(false)

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

ipcMain.on('user-login-main-process', (event, args) => {
    auth(args)
        .then(result => {
            result && mainWindow.loadFile(path.join(__dirname, 'views', 'sendInfo.html'))
        })
        .catch(err => {
            logger.error(err.message)
        })
})

ipcMain.on('email-sending-main-process', (event, args) => {
    global.mailProcess = args
    mainWindow.loadFile(path.join(__dirname, 'views', 'sendMail.html'))
})

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow()
    }
})