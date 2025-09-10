document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const session = document.getElementById("session").value.trim();
  const role = document.getElementById("role").value;

  // Validate password match
  if (password !== confirmPassword) {
    return Swal.fire({
      icon: 'warning',
      title: 'Oops!',
      text: 'Passwords do not match!',
      confirmButtonColor: '#d33'
    });
  }

  const userData = { fullName, email, password, session, role };

  try {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: data.message,
        confirmButtonColor: '#3085d6'
      });
      window.location.href = "login.html";
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: data.message || "An error occurred during registration.",
        confirmButtonColor: '#d33'
      });
    }

  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong. Please try again later.',
      confirmButtonColor: '#d33'
    });
  }
});
