const { ipcRenderer } = require('electron')
const Joi = require('@hapi/joi');

/*=========================[ Focus Input Field ]======================================*/
document.querySelectorAll('.input100').forEach((item) => {
    item.addEventListener('blur', () => {
        if (item.value.trim() !== "") {
            item.classList.add('has-val')
        } else {
            item.classList.remove('has-val')
        }
    })
})

document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault()

    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    inputValidation(email, password) && ipcRenderer.send('user-login-main-process', {email, password})
})

const inputValidation = (email, password) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().required().label('Email'),
        password: Joi.string().trim().min(5).required().label('Password')
    });

    const validateResult = schema.validate({
        email: email,
        password: password
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