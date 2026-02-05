// login.js
function signup() {
    document.querySelector(".login-form-container").style.display = "none";
    document.querySelector(".signup-form-container").style.display = "block";
    document.querySelector(".container").style.background = "linear-gradient(to bottom, rgb(56, 189, 149),  rgb(28, 139, 106))";
    document.querySelector(".button-1").style.display = "none";
    document.querySelector(".button-2").style.display = "block";
}

function login() {
    document.querySelector(".signup-form-container").style.display = "none";
    document.querySelector(".login-form-container").style.display = "block";
    document.querySelector(".container").style.background = "linear-gradient(to bottom, rgb(6, 108, 224),  rgb(14, 48, 122))";
    document.querySelector(".button-2").style.display = "none";
    document.querySelector(".button-1").style.display = "block";
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const signupErrorDiv = document.getElementById('signuperror');
    const loginErrorDiv = document.getElementById('loginError');

    // Handle login errors - Show message without switching forms
    if (urlParams.has('loginError') && loginErrorDiv) {
        loginErrorDiv.textContent = "Email ou mot de passe incorrect";
        loginErrorDiv.style.display = 'block';
        setTimeout(() => {
            loginErrorDiv.style.display = 'none';
        }, 8000);
        
        // Keep login form visible
        login();
    }

    // Handle signup errors - Switch to signup form if needed
    if (urlParams.has('fieldErrors') || urlParams.has('error')) {
        signup();
    }

    if (urlParams.has('formData')) {
        try {
            const formData = JSON.parse(urlParams.get('formData'));
            const inputs = document.querySelectorAll('#signup input');
            
            inputs.forEach(input => {
                const fieldName = input.name;
                if (formData[fieldName]) {
                    if (fieldName === 'dateN') {
                        input.type = 'date';
                        input.value = formData[fieldName];
                    } else if (fieldName === 'Tel') {
                        const digits = formData[fieldName].replace(/\D/g, '');
                        input.value = digits.replace(/(\d{2})(?=\d{2})/g, '$1-');
                    } else {
                        input.value = formData[fieldName];
                    }
                }
            });
        } catch (e) {
            console.error('Error parsing form data:', e);
        }
    }

    if (urlParams.has('fieldErrors')) {
        try {
            const fieldErrors = JSON.parse(urlParams.get('fieldErrors'));
            let errorHTML = '';
            
            for (const [field, message] of Object.entries(fieldErrors)) {
                errorHTML += `${message}<br>`;
            }
            
            signupErrorDiv.innerHTML = errorHTML;
            signupErrorDiv.style.display = 'block';
        } catch (e) {
            console.error('Error parsing errors:', e);
        }
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 10);
            value = value.replace(/(\d{2})(?=\d{2})/g, '$1-');
            e.target.value = value;
        });
    }
});