document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    //const role = document.getElementById("role").value;
  
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // ✅ Success modal
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome, ${data.user.fullname}`,
          confirmButtonColor: '#3085d6'
        });
  
        // Store common user details
        localStorage.setItem("user_id", data.user.id);
        localStorage.setItem("role", data.user.role);
  
        // Redirect based on role
        if (data.user.role === "student") {
          localStorage.setItem("student_id", data.user.id);
          localStorage.setItem("student_name", data.user.fullname);
          window.location.href = "student-dash.html";
        } else if (data.user.role === "instructor") {
          localStorage.setItem("instructor_id", data.user.id);
          localStorage.setItem("instructor_name", data.user.fullname);
          window.location.href = "instructor-dash.html";
        } else if (data.user.role === "admin") {
          localStorage.setItem("admin_id", data.user.id);
          localStorage.setItem("admin_name", data.user.fullname);
          window.location.href = "admin-dash.html";
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Error',
            text: 'Role not recognized!',
            confirmButtonColor: '#d33'
          });
        }
  
      } else {
        // ❌ Error from server (like invalid credentials)
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.message || 'Invalid credentials.',
          confirmButtonColor: '#d33'
        });
      }
  
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Something Went Wrong',
        text: 'An error occurred. Please try again later.',
        confirmButtonColor: '#d33'
      });
    }
  });
  