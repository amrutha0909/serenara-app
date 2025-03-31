document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Retrieve users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || {};

    // Check if the user exists and the password matches
    if (users[username] && users[username].password === password) {
        localStorage.setItem("username", username);
        if (users[username].email) {
            localStorage.setItem("email", users[username].email);
        }
        alert("Login successful! Welcome back, " + username + "!");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid username or password. Please try again or sign up.");
    }
});

// Password visibility toggle
const passwordInput = document.getElementById("password");
const toggleIcon = document.createElement("span");
toggleIcon.className = "password-toggle";
toggleIcon.textContent = "👁️";
passwordInput.parentElement.appendChild(toggleIcon);

toggleIcon.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.textContent = "👁️‍🗨️";
    } else {
        passwordInput.type = "password";
        toggleIcon.textContent = "👁️";
    }
});