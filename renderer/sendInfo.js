const { remote, ipcRenderer } = require('electron')
const { app, dialog } = remote
const { basename, dirname, join, normalize } = require('path')
const Joi = require('@hapi/joi')
const xlsx = require('xlsx')
const logger = require(join(__dirname, '../', 'util', 'logging'))(app)

let processInfo = {}

let openPath;

document.getElementById('sendBtn').addEventListener('click', e => {
    e.preventDefault()
    inputValidation() && ipcRenderer.send('email-sending-main-process', processInfo)
})

document.getElementById('emailSubject').addEventListener('click', e => {
    dialog.showOpenDialog({
        title: 'Select Email Subject File',
        defaultPath: typeof openPath==='undefined' ? app.getPath('home') : normalize(openPath),
        filters: [
            { name: 'Excel File', extensions: ['xlsm', 'xlsx', 'xls', 'xlt'] },
        ],
        properties: ['openFile']
    }, filename => {
        if (filename.length === 0) return
        openPath = dirname(filename[0])
        document.getElementById("emailSubjectFileName").innerHTML = basename(filename[0])
        processInfo.emailSubject = readXLFile(filename[0])
    })
})

document.getElementById('emailBody').addEventListener('click', e => {
    dialog.showOpenDialog({
        title: 'Select Email Body File',
        defaultPath: typeof openPath==='undefined' ? app.getPath('home') : normalize(openPath),
        filters: [
            { name: 'Excel File', extensions: ['xlsm', 'xlsx', 'xls', 'xlt'] },
        ],
        properties: ['openFile']
    }, filename => {
        if (filename.length === 0) return
        openPath = dirname(filename[0])  
        document.getElementById("emailBodyFileName").innerHTML = basename(filename[0])
        processInfo.emailBody = readXLFile(filename[0])
    })
})

document.getElementById('emailAddress').addEventListener('click', e => {
    dialog.showOpenDialog({
        title: 'Select Mail File',
        defaultPath: typeof openPath==='undefined' ? app.getPath('home') : normalize(openPath),
        filters: [
            { name: 'Excel File', extensions: ['xlsm', 'xlsx', 'xls', 'xlt'] },
        ],
        properties: ['openFile']
    }, filename => {
        if (filename.length === 0) return
        openPath = dirname(filename[0])
        document.getElementById("emailAddressFileName").innerHTML = basename(filename[0])
        processInfo.emailAddress = readXLFile(filename[0])
    })
})

document.getElementById('leadAddress').addEventListener('click', e => {
    dialog.showOpenDialog({
        title: 'Select Sender File',
        defaultPath: typeof openPath==='undefined' ? app.getPath('home') : normalize(openPath),
        filters: [
            { name: 'Excel File', extensions: ['xlsm', 'xlsx', 'xls', 'xlt'] },
        ],
        properties: ['openFile']
    }, filename => {
        if (filename.length === 0) return
        openPath = dirname(filename[0])
        document.getElementById("leadAddressFileName").innerHTML = basename(filename[0])
        processInfo.leadAddress = readXLFile(filename[0])
    })
})

const inputValidation = () => {
    const schema = Joi.object({
        emailSubject: Joi.required().label('Email Subject'),
        emailBody: Joi.required().label('Email Body'),
        emailAddress: Joi.required().label('Email Address'),
        leadAddress: Joi.required().label('Lead Mail')
    });

    const validateResult = schema.validate({
        emailSubject: processInfo.emailSubject,
        emailBody: processInfo.emailBody,
        emailAddress: processInfo.emailAddress,
        leadAddress: processInfo.leadAddress,
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

const readXLFile = (path) => {
    try {
        let book = xlsx.readFile(path)
        return xlsx.utils.sheet_to_json(book.Sheets[book.SheetNames[0]])
    } catch (err) {
        logger.error(err)
    }
}