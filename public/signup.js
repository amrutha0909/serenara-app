document.getElementById("signup-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    // Retrieve existing users from localStorage or initialize an empty object
    let users = JSON.parse(localStorage.getItem("users")) || {};

    // Check if username already exists
    if (users[username]) {
        alert("Username already exists! Please choose a different username.");
        return;
    }

    // Store the new user
    users[username] = { password, email };
    localStorage.setItem("users", JSON.stringify(users));

    // Store the current user for the session
    localStorage.setItem("username", username);
    if (email) {
        localStorage.setItem("email", email);
    }

    alert("Sign up successful! Welcome, " + username + "!");
    window.location.href = "dashboard.html";
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