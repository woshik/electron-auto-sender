const { getGlobal } = require('electron').remote
const xlsx = require('xlsx')
const nodemailer = require('nodemailer')

let {
    mailBody,
    mailFile,
    mailSendInterval,
    mailSubject,
    sendFromPerMail,
    senderFile
} = getGlobal('mailProcess')

mailSendInterval *= 1000

const senderBook = xlsx.readFile(mailFile, {sheetRows: 5});
const senderSheet = senderBook.SheetNames;
let senderRow = xlsx.utils.sheet_to_json(senderBook.Sheets[senderSheet[0]]);

const leadBook = xlsx.readFile(senderFile);
const leadSheet = leadBook.SheetNames;
let leadRow = xlsx.utils.sheet_to_json(leadBook.Sheets[leadSheet[0]]);

let i = 0
let senderInfo = senderRow.pop()
let leadMail

let sendEmailInterval = setInterval(() => {

    (i === sendFromPerMail) && (senderInfo = senderRow.pop()) && (i = 0)

    leadMail = leadRow.pop()

    if (typeof leadMail === "undefined" || typeof senderInfo === "undefined") {
        clearInterval(sendEmailInterval)
    }

    let smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderInfo.email,
            pass: senderInfo.password
        }
    })

    let textarea = document.getElementById('sendingInfo')

    smtpTransport.sendMail({
            from: senderInfo.email,
            to: leadMail.lead,
            subject: mailSubject,
            text: mailBody
        })
        .then(result => {
            textarea.value += `\nFrom ${senderInfo.email} To ${leadMail.lead}`
        })
        .catch(err => {
            textarea.value += `\n${err.message}`
        })
    i++
}, mailSendInterval);