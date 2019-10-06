const { getGlobal } = require('electron').remote
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');

let {
	mailBody,
	mailFile,
	mailSendInterval,
	mailSubject,
	sendFromPerMail,
	senderFile
} = getGlobal('mailProcess')

mailSendInterval *= 1000

const senderBook = xlsx.readFile(mailFile);
const senderSheet = senderBook.SheetNames;
let senderRow = xlsx.utils.sheet_to_json(senderBook.Sheets[senderSheet[0]]);

const leadBook = xlsx.readFile(senderFile);
const leadSheet = leadBook.SheetNames;
let leadRow = xlsx.utils.sheet_to_json(leadBook.Sheets[leadSheet[0]]);

senderRow.map((senderInfo) => {
    let i = 0

    var sendEmailInterval = setInterval(() => {

        var leadMail = leadRow.pop()
       
        if ( typeof leadMail === "undefined" ) {
            console.log('All lead is completed to send email')
            return
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
        	textarea.value += err.message
        })

        i++

        i === sendFromPerMail && clearInterval(sendEmailInterval)
    }, mailSendInterval);
});