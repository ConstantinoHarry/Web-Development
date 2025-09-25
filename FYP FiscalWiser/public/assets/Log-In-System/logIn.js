
// Toggle between login and signup forms
document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.querySelector('.login__container');
    const signupContainer = document.getElementById('signupContainer');
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');
    
    // Show signup form
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'flex';
    });
    
    // Show login form
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'flex';
    });
    
    // Form submission handlers
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Add your login logic here
        console.log('Login attempt with:', username, password);
        // firebase auth would go here
        
        // For demo purposes, just show an alert
        alert('Login functionality would be implemented here');
    });
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Add your signup logic here
        console.log('Signup attempt with:', username, email, password);
        // firebase auth would go here
        
        // For demo purposes, just show an alert
        alert('Signup functionality would be implemented here');
    });
});
