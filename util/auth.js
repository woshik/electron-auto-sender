const path = require('path')
const os = require('os')
const mac = require('getmac')
const { dialog } = require('electron')
const mongo = require(path.join(__dirname, 'database'))

module.exports = (args) => {
    return new Promise((resolve, reject) => {
        mongo()
            .then(db => {
                db.createCollection('users')
                    .then(collecation => {
                        collecation.findOne({ email: args.email, password: args.password })
                            .then(userInfo => {
                                if (userInfo === null) {
                                    dialog.showMessageBoxSync({
                                        type: "error",
                                        title: "User Not Found",
                                        message: "You are not a register user. Please contact on this number, 01947738405."
                                    })

                                    return resolve(false)
                                }

                                if (typeof userInfo.other_computers !== "undefined" && userInfo.other_computers.length === 5) {
                                    dialog.showMessageBoxSync({
                                        type: "error",
                                        title: "Account Blocked",
                                        message: "You try to login from another computer too many times, Please contact 01947738405 for unblock your account."
                                    })

                                    return resolve(false)
                                }

                                if (!userInfo.permission) {
                                    mac.getMac(async (err, macAddress) => {
                                        return reject(err)

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

                                    return resolve(true)
                                }

                                if (mac.isMac(userInfo.mac_address)) {
                                    return resolve(true)
                                } else {
                                    mac.getMac(async (err, macAddress) => {
                                        reject(err)

                                        collecation.updateOne({
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
                                        }).catch(err => {
                                            reject(err)
                                        })

                                        dialog.showMessageBoxSync({
                                            type: "warning",
                                            title: "Account Warning",
                                            message: "Don't try to login this account from another computer. If you want to use on this computer, Please contact 01947738405."
                                        })
                                    })
                                }
                            })
                            .catch(err => {
                                return reject(err)
                            })
                    })
                    .catch(err => {
                        return reject(err)
                    })
            })
            .catch(err => {
                return reject(err)
            })
    })
}