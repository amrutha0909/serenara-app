document.getElementById("feedback-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const message = document.getElementById("message").value;

    console.log("Feedback:", { name, email, rating, message });
    alert("Thank you for your feedback, " + name + "! We’ll use your input to improve Serenity Space.");
    document.getElementById("feedback-form").reset();
});