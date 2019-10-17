const { remote, ipcRenderer } = require('electron')
const { dialog } = remote
const nodemailer = require('nodemailer')

let processInfo, loop, smtpTransport, emailRow = emailSubjectRow = emailBodyRow = leadRow = 0;

ipcRenderer.on('email-sending-renderer-process', (event, payload) => {
    processInfo = payload
})

const sendMail = async () => {
    while (loop) {
        await new Promise(resolve => {

            if (!processInfo.emailAddress[emailRow]) emailRow = 0
            if (!processInfo.emailSubject[emailBodyRow]) emailBodyRow = 0
            if (!processInfo.emailBody[emailSubjectRow]) emailSubjectRow = 0
            if (!processInfo.leadAddress[leadRow]) {
                loop = false
                dialog.showMessageBox({
                    type: "info",
                    title: "Lead Complete",
                    message: "Send Email To All Lead Address"
                })
                return resolve()
            }

            try {
                smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: processInfo.emailAddress[emailRow].email,
                        pass: processInfo.emailAddress[emailRow].password
                    }
                })
            } catch (err) {
                logger.error(err.message)
            }

            emailRow = emailBodyRow = emailSubjectRow = ++leadRow

            smtpTransport.sendMail({
                    from: processInfo.emailAddress[emailRow].email,
                    to: processInfo.leadAddress[leadRow].lead,
                    subject: processInfo.emailBody[emailSubjectRow].sbuject,
                    text: processInfo.emailBody[emailSubjectRow].body
                })
                .then(result => {
                    document.getElementById('sendingInfo').value += `\n${leadRow}. From ${processInfo.emailAddress[emailRow].email} To ${processInfo.leadAddress[leadRow].lead}`
                    return resolve()
                })
                .catch(err => {
                    document.getElementById('sendingInfo').value += `\n${leadRow}. ${err.message}`
                    return resolve()
                })
        })
    }
}

document.getElementById('startBtn').addEventListener('click', () => {
    loop = true
    sendMail()
})


document.getElementById('stopBtn').addEventListener('click', () => {
    loop = false
})