document.addEventListener('DOMContentLoaded', async () => {
    const courseList = document.getElementById('course-list');
    const studentId = localStorage.getItem('student_id');

    try {
        const response = await fetch('http://localhost:3000/courses');
        const courses = await response.json();

        if (courses.length === 0) {
            courseList.innerHTML = "<p>No courses available.</p>";
            return;
        }

        for (const course of courses) {
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            const button = document.createElement('button');
            button.className = 'enroll-btn';
            button.dataset.courseId = course.id;
            button.textContent = 'Enroll';

            courseCard.innerHTML = `
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <p><strong>Instructor:</strong> ${course.instructor}</p>
            `;
            courseCard.appendChild(button);
            courseList.appendChild(courseCard);

            if (studentId) {
                const statusRes = await fetch(`http://localhost:3000/enrollment-status?studentId=${studentId}&courseId=${course.id}`);
                const statusData = await statusRes.json();

                if (statusData.status === 'approved') {
                    button.disabled = true;
                    button.textContent = 'Enrolled.';
                } else if (statusData.status === 'pending') {
                    button.disabled = true;
                    button.textContent = 'Processing...';
                    checkEnrollmentStatus(studentId, course.id, button);
                }
            }

            button.addEventListener('click', async (e) => {
                const courseId = e.target.getAttribute('data-course-id');

                if (!studentId) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Not Logged In',
                        text: 'Please log in to enroll.',
                        confirmButtonColor: '#3085d6'
                    });
                    return;
                }

                button.disabled = true;
                button.textContent = "Processing...";

                try {
                    const enrollResponse = await fetch('http://localhost:3000/request-enrollment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ student_id: studentId, course_id: courseId })
                    });

                    const enrollResult = await enrollResponse.json();

                    if (enrollResponse.ok) {
                        checkEnrollmentStatus(studentId, courseId, button);
                        Swal.fire({
                            icon: 'success',
                            title: 'Enrollment Requested',
                            text: 'Your request has been sent to the admin for approval.',
                            confirmButtonColor: '#3085d6'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Enrollment Failed',
                            text: enrollResult.message || 'Something went wrong.',
                            confirmButtonColor: '#d33'
                        });
                        button.disabled = false;
                        button.textContent = "Enroll";
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Network Error',
                        text: 'An error occurred while sending your request. Please try again.',
                        confirmButtonColor: '#d33'
                    });
                    button.disabled = false;
                    button.textContent = "Enroll";
                }
            });
        }

    } catch (error) {
        console.error('Error fetching courses:', error);
        courseList.innerHTML = "<p>Failed to load courses.</p>";
    }
});

async function checkEnrollmentStatus(studentId, courseId, button) {
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`http://localhost:3000/enrollment-status?studentId=${studentId}&courseId=${courseId}`);
            const data = await res.json();

            if (data.status === 'approved') {
                button.disabled = true;
                button.textContent = 'Enrolled.';
                clearInterval(interval);
            } else if (data.status === 'rejected') {
                button.disabled = false;
                button.textContent = 'Enroll';
                clearInterval(interval);

                Swal.fire({
                    icon: 'info',
                    title: 'Enrollment Rejected',
                    text: 'Your enrollment request was rejected by the admin.',
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (err) {
            console.error("Error checking enrollment status:", err);
        }
    }, 3000);
}

// Logout Function
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
