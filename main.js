const { app, BrowserWindow } = require('electron')
const path = require('path')
const mongo = require('./util/database');
const MongoClient = require('mongodb').MongoClient;
let win

function createMainWindow() {
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
    console.log(MongoClient);
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