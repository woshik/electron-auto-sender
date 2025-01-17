const { getGlobal, app, dialog } = require('electron').remote
const xlsx = require('xlsx')
const nodemailer = require('nodemailer')
const path = require('path')
const logger = require(path.join(__dirname, '../', 'util', 'logging'))(app)

let {
    mailBody,
    mailFile,
    mailSubject,
    sendFromPerMail,
    senderFile
} = getGlobal('mailProcess')

try {
    const emailBook = xlsx.readFile(mailFile);
    const emailSheet = emailBook.SheetNames;
    var emails = xlsx.utils.sheet_to_json(emailBook.Sheets[emailSheet[0]]);

    const leadBook = xlsx.readFile(senderFile);
    const leadSheet = leadBook.SheetNames;
    var leads = xlsx.utils.sheet_to_json(leadBook.Sheets[leadSheet[0]]);
} catch (err) {
    logger.error(err.message)
}
console.log(mailBody)
let sendEmailInterval,
    smtpTransport,
    emailRow = 0,
    leadRow = 0,
    lead = [],
    email = [],
    notSendToLead = [],
    i = 0,
    loop,
    skipEmail = 0

const sendMail = async () => {
    while (loop) {
        await new Promise(resolve => {

            lead = leads[leadRow]

            if(i === sendFromPerMail || skipEmail === 5){
                i = 0
                skipEmail = 0
            }

            if (lead === undefined) {
                loop = false
                dialog.showMessageBox({
                    type: "info",
                    title: "Lead Complete",
                    message: "Send Email To All Lead Address"
                })
                return resolve()
            }

            if (i === 0) {

                email = emails[emailRow]

                if (email === undefined) {
                    loop = false
                    dialog.showMessageBox({
                        type: "info",
                        title: "Email Complete",
                        message: "All Sender Mail Address completed"
                    })
                    return resolve()
                }

                try {
                    smtpTransport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: email.email,
                            pass: email.password
                        }
                    })
                } catch (err) {
                    logger.error(err.message)
                }

                emailRow++
            }

            let textarea = document.getElementById('sendingInfo')

            smtpTransport.sendMail({
                    from: email.email,
                    to: lead.lead,
                    subject: mailSubject,
                    html: mailBody
                })
                .then(result => {
                    textarea.value += `\n${leadRow}. From ${email.email} To ${lead.lead}`
                    skipEmail = 0
                    resolve()
                })
                .catch(err => {
                    skipEmail++
                    notSendToLead.push(lead.lead)
                    textarea.value += `\n${leadRow}. ${err.message}`
                    resolve()
                })

            leadRow++
            i++
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