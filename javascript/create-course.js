// Populate instructor dropdown on page load
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/admin/active-instructors')
        .then(response => response.json())
        .then(data => {
            const instructorSelect = document.getElementById('instructorSelect');
            
            // Clear any previous options (if needed)
            instructorSelect.innerHTML = '<option value="">Select Instructor</option>';

            data.forEach(instructor => {
                const option = document.createElement('option');
                option.value = instructor.id; // Keep ID as value
                option.textContent = instructor.fullname; // FIX: Use fullname, not name
                instructorSelect.appendChild(option);
            });

            console.log("Instructor dropdown populated.");
        })
        .catch(error => {
            console.error('Error fetching instructors:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unable to load instructors. Please try again.',
            });
        });
});


document.getElementById('courseForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const instructorId = document.getElementById('instructorSelect').value;

    // Validate inputs
    if (!title || !description || !instructorId) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'All fields are required!',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const courseData = {
        title: title,
        description: description,
        instructor_id: instructorId
    };

    fetch('http://localhost:3000/create-course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire({
            icon: 'success',
            title: 'Course Created',
            text: data.message,
            confirmButtonColor: '#3085d6'
        }).then(() => {
            window.location.href = "admin-dash.html";
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error creating the course. Please try again later.',
            confirmButtonColor: '#d33'
        });
    });
});

// Logout Function (no change)
function logout() {
    Swal.fire({
        title: 'Logout',
        text: 'Are you sure you want to log out?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Yes, log out'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "login.html";
        }
    });
}
