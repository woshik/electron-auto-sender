const { app, BrowserWindow } = require('electron')
const path = require('path')
const mongo = require('./util/database')
let win

function createMainWindow() {

    mongo
    .then(result => {
        win = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
        })
    
        win.loadFile(path.join(__dirname, 'views', 'login.html'))
    
        win.once('ready-to-show', () => {
            win.show()
        })

        console.log(result);
    })
    .catch(err => {
        throw err
    })

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createMainWindow()
    }
})