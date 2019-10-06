const {remote, ipcRenderer} = require('electron')
const { app, dialog } = remote
const Joi = require('@hapi/joi');
let processInfo = {}

document.getElementById('sendBtn').addEventListener('click', e => {
    e.preventDefault()

    processInfo.sendFromPerMail = document.getElementById('sendFromPerMail').value
    processInfo.mailSendInterval = document.getElementById('mailSendInterval').value
    processInfo.mailSubject = document.getElementById('mailSubject').value
    processInfo.mailBody = document.getElementById('mailBody').value

    inputValidation() && ipcRenderer.send('email-sending-main-process', processInfo)
})

document.getElementById('mailFile').addEventListener('click', e => {
    dialog.showOpenDialog({
        title: 'Select Mail File',
        defaultPath: app.getPath('home'),
        filters: [
            { name: 'Excel File', extensions: ['xls', 'xlsx'] },
        ],
        properties: ['openFile']
    }, filename => {
        processInfo.mailFile = filename[0]
    })
})

document.getElementById('senderFile').addEventListener('click', e => {
    dialog.showOpenDialog({
        title: 'Select Sender File',
        defaultPath: app.getPath('home'),
        filters: [
            { name: 'Excel File', extensions: ['xls', 'xlsx'] },
        ],
        properties: ['openFile']
    }, filename => {
        processInfo.senderFile = filename[0]
    })
})

const inputValidation = () => {
    const schema = Joi.object({
        sendFromPerMail: Joi.number().required().label('Send from per mail'),
        mailSendInterval:Joi.number().required().label('Mail Send Interval'),
        mailSubject: Joi.string().trim().required().label('Mail Subject'),
        mailBody: Joi.string().trim().required().label('Mail Body'),
        mailFile: Joi.string().trim().required().label('Mail Address'),
        senderFile: Joi.string().trim().required().label('Sender Mail')
    });

    const validateResult = schema.validate({
        sendFromPerMail: processInfo.sendFromPerMail,
        mailSendInterval: processInfo.mailSendInterval,
        mailSubject: processInfo.mailSubject,
        mailBody: processInfo.mailBody,
        mailFile: processInfo.mailFile,
        senderFile: processInfo.senderFile,
    });

    if (validateResult.error) {
        showErrorMessage(errorMessage(validateResult.error.details[0]))
        return false
    }

    let div = document.getElementById('alertClosebtn')
    if (div) {
        div.parentElement.style.opacity = '0'
        setTimeout(() => {
            div.parentElement.style.display = 'none';
        }, 800)
    }
    processInfo = validateResult.value
    return true
}

const errorMessage = error => {
    switch (error.type) {
        case "string.empty":
            return `${error.context.label} is required`;
        case "string.email":
            return "Enter valid mail address";
        case "any.required":
            return `${error.context.label} is required`;
        default:
            return error.message;
    }
}

const showErrorMessage = message => {
    document.getElementById("message").innerHTML = `<div class="alert alert-danger"><span id="alertClosebtn">&times;</span>${message}</div>`

    document.getElementById("alertClosebtn").onclick = (e) => {
        e.path[1].style.opacity = "0"
        setTimeout(() => {
            e.path[1].style.display = "none";
        }, 800)
    }
}