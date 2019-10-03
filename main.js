const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

function createMainWindow () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        minWidth:1000,
        minHeight:750,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    const ses = mainWindow.webContents.session
    // ses.cookies.set({name:'auth', value:'woshikuzzaman'}, (argument) => {
    // })

    ses.cookies.get({}, (err, result) => {
            console.log(result)
        })
    
    mainWindow.loadFile(path.join(__dirname, 'views', 'login.html'))

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

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