document.addEventListener("DOMContentLoaded", () => {
    const studentId = localStorage.getItem("student_id");
    const studentName = localStorage.getItem("student_name");
    const courseList = document.getElementById("studentCourses");
    const studentNameElement = document.getElementById("studentName");
    const studentIdElement = document.getElementById("studentId");

    if (!studentId) {
        Swal.fire({
            icon: "warning",
            title: "Student ID not found",
            text: "Please log in again.",
            confirmButtonText: "Go to Login"
        }).then(() => {
            window.location.href = "login.html";
        });
        return;
    }

    studentNameElement.textContent = studentName || "Student";
    studentIdElement.textContent = studentId;

    fetch(`http://localhost:3000/student-courses/${studentId}`)
        .then(response => response.json())
        .then(courses => {
            courseList.innerHTML = "";

            if (courses.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "No Courses Found",
                    text: "You are not enrolled in any courses yet.",
                });
                courseList.innerHTML = "<p>You are not enrolled in any courses yet.</p>";
                return;
            }

            courses.forEach(course => {
                const courseItem = document.createElement("div");
                courseItem.classList.add("course-card");
                courseItem.innerHTML = `
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <small><i class="fas fa-calendar-alt"></i> Enrolled on: ${new Date(course.enrolled_at).toDateString()}</small>
                    
                    <div class="course-progress">
                        <p>Progress: <span id="progress-${course.id}">Loading...</span>%</p>
                        <progress id="progress-bar-${course.id}" value="0" max="100"></progress>
                    </div>

                    <button class="btn" onclick="toggleCourseMaterials(${course.id})">View Materials</button>
                    <button class="btn" onclick="toggleIncourseMarks(${course.id})">View In-course Marks</button>

                    <div id="materials-section-${course.id}" class="materials-section" style="display: none;"></div>
                    <div id="marks-section-${course.id}" class="marks-section" style="display: none; margin-top: 10px;"></div>
                `;
                courseList.appendChild(courseItem);

                fetchStudentProgress(studentId, course.id);
            });
        })
        .catch(error => {
            console.error("Error fetching courses:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load courses. Please try again later.",
            });
            courseList.innerHTML = "<p>Failed to load courses. Please try again later.</p>";
        });
        fetchCertificates(studentId);

});

async function toggleIncourseMarks(courseId) {
    const studentId = localStorage.getItem("student_id");
    const marksSection = document.getElementById(`marks-section-${courseId}`);

    if (marksSection.style.display === "none" || marksSection.innerHTML === "") {
        try {
            const response = await fetch(`http://localhost:3000/student-marks/${studentId}/${courseId}`);
            const marks = await response.json();

            if (response.ok) {
                    marksSection.innerHTML = `
                        <h4 style="margin-bottom: 10px;">In-course Marks Summary</h4>
                        <table style="
                            width: 100%;
                            border-collapse: collapse;
                            background-color: #f9f9f9;
                            border-radius: 6px;
                            overflow: hidden;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        ">
                            <thead>
                                <tr style="background-color: #4CAF50; color: white;">
                                    <th style="padding: 12px;align: left">Component</th>
                                    <th style="padding: 12px;">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="padding: 10px;">Midterm 1</td><td style="padding: 10px;">${marks.midterm_1 || 0}</td></tr>
                                <tr><td style="padding: 10px;">Midterm 2</td><td style="padding: 10px;">${marks.midterm_2 || 0}</td></tr>
                                <tr><td style="padding: 10px;">Assignment</td><td style="padding: 10px;">${marks.assignment || 0}</td></tr>
                                <tr><td style="padding: 10px;">Presentation</td><td style="padding: 10px;">${marks.presentation || 0}</td></tr>
                                <tr><td style="padding: 10px;">Quiz/Test</td><td style="padding: 10px;">${marks.quiz_test || 0}</td></tr>
                                <tr><td style="padding: 10px;">Total Classes</td><td style="padding: 10px;">${marks.total_classes || 0}</td></tr>
                                <tr><td style="padding: 10px;">Classes Absent</td><td style="padding: 10px;">${marks.classes_absent || 0}</td></tr>
                                <tr><td style="padding: 10px;">Attendance Marks</td><td style="padding: 10px;">${marks.attendance_marks || 0}</td></tr>
                                <tr style="font-weight: bold; background-color: #f1f1f1;">
                                    <td style="padding: 10px;">Total Marks</td>
                                    <td style="padding: 10px;">${marks.total_marks || 0}</td>
                                </tr>
                            </tbody>
                        </table>
                    `;
                } else {
                    marksSection.innerHTML = `<p style="color: red;">${marks.message}</p>`;
                }

            marksSection.style.display = "block";
        } catch (error) {
            console.error("Error fetching in-course marks:", error);
            Swal.fire({
                icon: "error",
                title: "Failed to Load Marks",
                text: "An error occurred while fetching marks. Try again later.",
            });
        }
    } else {
        marksSection.style.display = "none";
    }
}

async function toggleCourseMaterials(courseId) {
    const materialsSection = document.getElementById(`materials-section-${courseId}`);

    if (materialsSection.style.display === "none" || materialsSection.innerHTML === "") {
        try {
            const response = await fetch(`http://localhost:3000/course-materials/${courseId}`);
            const materials = await response.json();

            materialsSection.innerHTML = "";

            if (materials.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "No Materials Found",
                    text: "No materials uploaded for this course yet.",
                });
                materialsSection.innerHTML = "<p>No materials uploaded for this course yet.</p>";
                materialsSection.style.display = "block";
                return;
            }

            materials.forEach(material => {
                const fileExtension = material.file_path.split('.').pop().toLowerCase();
                let preview = "";

                if (["jpg", "png", "jpeg"].includes(fileExtension)) {
                    preview = `
                        <div class="preview-container">
                            <img src="http://localhost:3000/uploads/${material.file_name}" alt="Image Preview" class="file-preview">
                            <button class="close-preview-btn btn" onclick="closePreview(this)">Close Preview</button>
                        </div>
                    `;
                } else if (fileExtension === "pdf") {
                    preview = `
                        <div class="preview-container">
                            <iframe src="http://localhost:3000/uploads/${material.file_name}" class="file-preview"></iframe><br>
                            <button class="fullscreen-btn btn" onclick="openFullScreen('http://localhost:3000/uploads/${material.file_name}')">View Full Screen</button>
                        </div>
                    `;
                } else {
                    preview = `<p>No preview available for this file type.</p>`;
                }

                const materialItem = document.createElement("div");
                materialItem.classList.add("material-item");
                materialItem.innerHTML = `
                    <h4>${material.file_name}</h4>
                    ${preview}
                    <a href="http://localhost:3000/uploads/${material.file_name}" download class="download-btn btn">
                        <i class="fas fa-download"></i> Download
                    </a>
                `;
                materialsSection.appendChild(materialItem);
            });

            materialsSection.style.display = "block";
        } catch (error) {
            console.error("Error fetching course materials:", error);
            Swal.fire({
                icon: "error",
                title: "Failed to Load Materials",
                text: "An error occurred while fetching course materials.",
            });
        }
    } else {
        materialsSection.style.display = "none";
    }
}

function fetchStudentProgress(studentId, courseId) {
    fetch(`http://localhost:3000/course-progress/${courseId}`)
        .then(response => response.json())
        .then(data => {
            const progressElement = document.getElementById(`progress-${courseId}`);
            const progressBar = document.getElementById(`progress-bar-${courseId}`);

            if (data.message) {
                progressElement.textContent = "0";
                progressBar.value = 0;
            } else {
                progressElement.textContent = data.progress;
                progressBar.value = data.progress;
            }
        })
        .catch(error => {
            console.error("Error fetching student progress:", error);
        });
}

function closePreview(button) {
    button.parentElement.style.display = "none";
}

function openFullScreen(url) {
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
        Swal.fire({
            icon: "info",
            title: "Popup Blocked",
            text: "Please allow pop-ups to view the full-screen preview.",
        });
    }
}

async function showUserProfile(studentId) {
    try {
        const response = await fetch(`http://localhost:3000/user-profile/${studentId}`);
        const user = await response.json();

        if (!response.ok) {
            return Swal.fire('Error', user.message || 'Failed to load profile.', 'error');
        }

        Swal.fire({
            title: '👤 Profile Details',
            html: `
                <div style="text-align: left; font-size: 15px; padding: 10px;">
                    <p><strong>ID:</strong> ${user.id}</p>
                    <p><strong>Full Name:</strong> ${user.fullname}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Session:</strong> ${user.session}</p>
                    <p><strong>Mobile:</strong> ${user.mobile_number}</p>
                    <p><strong>Address:</strong> ${user.address}</p>
                    <p><strong>Date of Birth:</strong> ${user.dob}</p>
                    <p><strong>Gender:</strong> ${user.gender}</p>
                    <p><strong>Blood Group:</strong> ${user.blood_group}</p>
                   
                    <p><strong>Role:</strong> ${user.role}</p>
                </div>
                <a href="#" class="btn update-profile-btn" onclick="updateUserProfile()">Update Profile</a>
            `,
            icon: 'info',
            confirmButtonText: 'Close',
            customClass: {
                popup: 'swal2-rounded'
            }
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        Swal.fire('Error', 'Could not load profile.', 'error');
    }
}

document.getElementById('viewProfileBtn').addEventListener('click', () => {
  const studentId = document.getElementById('studentId').textContent;
  showUserProfile(studentId);
});

function formatDatePretty(dateString) {
    if (!dateString) return '';
    const dateObj = new Date(dateString);

    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();

    // Add st, nd, rd, th
    const suffix =
        day % 10 === 1 && day !== 11 ? 'st' :
        day % 10 === 2 && day !== 12 ? 'nd' :
        day % 10 === 3 && day !== 13 ? 'rd' : 'th';

    return `${day}${suffix} ${month}, ${year}`;
}


function updateUserProfile() {
    const studentId = localStorage.getItem("student_id");

    fetch(`http://localhost:3000/user-profile/${studentId}`)
        .then(res => res.json())
        .then(user => {
            // Convert DOB to YYYY-MM-DD if it exists
            let formattedDob = '';
            if (user.dob) {
                const dateObj = new Date(user.dob);
                formattedDob = dateObj.toISOString().split('T')[0]; // Keep only the date
            }
            Swal.fire({
                title: 'Update Profile',
                html: `
                    <input id="fullname" class="swal2-input" placeholder="Full Name" value="${user.fullname}">
                    <input id="email" type="email" class="swal2-input" placeholder="Email" value="${user.email}">
                    <input id="mobile" class="swal2-input" placeholder="Mobile Number" value="${user.mobile_number || ''}">
                    <input id="address" class="swal2-input" placeholder="Address" value="${user.address || ''}">
                    <input id="blood_group" class="swal2-input" placeholder="Blood Group" value="${user.blood_group || ''}">
                    <input id="guardian_name" class="swal2-input" placeholder="Guardian Name" value="${user.guardian_name || ''}">
                    <input id="guardian_contact" class="swal2-input" placeholder="Guardian Contact Number" value="${user.guardian_contact || ''}">
                    <input id="dob" type="date" class="swal2-input" value="${user.dob || ''}">
                    <select id="gender" class="swal2-input">
                        <option value="">Select Gender</option>
                        <option value="Male" ${user.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${user.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${user.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                `,
                confirmButtonText: 'Save Changes',
                preConfirm: () => {
                    return {
                        fullname: document.getElementById('fullname').value,
                        email: document.getElementById('email').value,
                        mobile_number: document.getElementById('mobile').value,
                        address: document.getElementById('address').value,
                        dob: document.getElementById('dob').value,
                        gender: document.getElementById('gender').value,
                        blood_group: document.getElementById('blood_group').value,
                        guardian_name: document.getElementById('guardian_name').value, 
                        guardian_contact: document.getElementById('guardian_contact').value
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`http://localhost:3000/update-profile/${studentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(result.value)
                    })
                    .then(res => res.json())
                    .then(data => Swal.fire('Updated!', data.message, 'success'))
                    .catch(err => Swal.fire('Error!', 'Failed to update profile', 'error'));
                }
            });
        });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get ordinal suffix for the day (1st, 2nd, 3rd, etc.)
  function getOrdinal(n) {
    const s=["th","st","nd","rd"],
          v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }

  return `${getOrdinal(day)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
}

async function fetchCertificates(studentId) {
  const container = document.getElementById("certificates");
  try {
    const res = await fetch(`http://localhost:3000/student/certificates/${studentId}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>No certificates available.</p>";
      return;
    }

    container.innerHTML = data.map(cert => `
      <div class="certificate-card">
        <p><strong id="xyz">${cert.course_name}</strong></p>
        <p>Issued on: ${formatDate(cert.issued_at)}</p>
        <iframe src="${cert.file_path}" class="file-preview"></iframe>
        <a href="${cert.file_path}" download class="btn download-btn"><br>
          <i class="fa-solid fa-download"></i> Download
        </a>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error fetching certificates:", err);
    container.innerHTML = "<p>Failed to load certificates.</p>";
  }
}


function logout() {
    Swal.fire({
        icon: "question",
        title: "Confirm Logout",
        text: "Are you sure you want to log out?",
        showCancelButton: true,
        confirmButtonText: "Logout",
        cancelButtonText: "Cancel"
    }).then(result => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "login.html";
        }
    });
}
