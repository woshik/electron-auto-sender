const { getGlobal, app } = require('electron').remote
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

let sendEmailInterval,
    smtpTransport,
    emailRow = 0,
    leadRow = 0,
    lead = [],
    email = [],
    notSendToLead = [],
    i = 0,
    loop


const sendMail = async () => {
    while (loop) {
        await new Promise(resolve => {

            lead = leads[leadRow]

            i === sendFromPerMail && (i = 0)

            if (typeof lead === "undefined") {
                loop = false
                return resolve()
            }

            if (i === 0) {

                email = emails[emailRow]

                if (typeof email === "undefined") {
                    loop = false
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
                    text: mailBody
                })
                .then(result => {
                    textarea.value += `\n${leadRow}. From ${email.email} To ${lead.lead}`
                    resolve()
                })
                .catch(err => {
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