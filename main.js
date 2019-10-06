const os = require('os')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const mac = require('getmac')
const mongo = require('./util/database.js')

let mainWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        minWidth: 1000,
        minHeight: 750,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile(path.join(__dirname, 'views', 'login.html'))

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

ipcMain.on('user-login-main-process', (event, args) => {
    mongo()
        .then(db => {
            db.createCollection('users')
                .then(collecation => {
                    collecation.findOne({ email: args.email, password: args.password })
                        .then(userInfo => {
                            if (userInfo === null) {
                                return dialog.showMessageBoxSync(mainWindow, {
                                    type: "error",
                                    title: "User Not Found",
                                    message: "You are not a register user. Please contact on this number, 01947738405."
                                })
                            }

                            if (typeof userInfo.other_computers !== "undefined" && userInfo.other_computers.length === 5) {
                                return dialog.showMessageBoxSync(mainWindow, {
                                        type: "error",
                                        title: "Account Blocked",
                                        message: "You try to login from another computer too many times, Please contact 01947738405 for unblock your account."
                                    })
                            }

                            if (!userInfo.permission) {
                                mac.getMac(async (err, macAddress) => {
                                    if (err) throw err

                                    await collecation.updateOne({
                                        email: args.email,
                                        password: args.password,
                                        permission: false
                                    }, {
                                        '$set': {
                                            "permission": true,
                                            mac_address: macAddress,
                                            username: os.userInfo().username,
                                            platform: os.platform(),
                                            hostname: os.hostname()
                                        }
                                    })
                                })

                                return mainWindow.loadFile(path.join(__dirname, 'views', 'sendInfo.html'))
                            }

                            if (mac.isMac(userInfo.mac_address)) {
                                mainWindow.loadFile(path.join(__dirname, 'views', 'sendInfo.html'))
                            } else {
                                mac.getMac(async (err, macAddress) => {
                                    if (err) throw err

                                    await collecation.updateOne({ 
                                        email: args.email, 
                                        password: args.password, 
                                        permission: true 
                                    }, { 
                                        '$push': {
                                            other_computers: {
                                                mac_address: macAddress,
                                                username: os.userInfo().username,
                                                platform: os.platform(),
                                                hostname: os.hostname()
                                            }
                                        } 
                                    })

                                    dialog.showMessageBoxSync(mainWindow, {
                                        type: "warning",
                                        title: "Account Warning",
                                        message: "Don't try to login this account from another computer. If you want to use on this computer, Please contact 01947738405."
                                    })
                                })
                            }
                        })
                        .catch(err => {
                            throw err
                        })
                })
                .catch(err => {
                    throw err
                })
        })
        .catch(err => {
            throw err
        })
})

ipcMain.on('email-sending-main-process', (event, args) => {
    mainWindow.loadFile(path.join(__dirname, 'views', 'sendMail.html'))
    global.mailProcess = args
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