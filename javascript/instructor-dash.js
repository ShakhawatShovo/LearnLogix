document.addEventListener("DOMContentLoaded", () => {
    const instructorId = localStorage.getItem("instructor_id");
    const instructorName = localStorage.getItem("instructor_name");
    const courseList = document.getElementById("course-list");
    const instructorNameElement = document.getElementById("instructorName");
    const instructorIdElement = document.getElementById("instructorId");

    if (!instructorId) {
        Swal.fire({
            icon: 'error',
            title: 'Missing ID',
            text: 'Instructor ID not found. Please log in again.',
        }).then(() => {
            window.location.href = "login.html";
        });
        return;
    }

    instructorNameElement.textContent = instructorName || "Instructor";
    instructorIdElement.textContent = instructorId;

    fetch(`http://localhost:3000/instructor-courses/${instructorId}`)
        .then(response => response.json())
        .then(courses => {
            courseList.innerHTML = "";

            if (courses.length === 0) {
                courseList.innerHTML = "<p>No courses assigned yet.</p>";
                return;
            }

            courses.forEach(course => {
                const courseItem = document.createElement("div");
                courseItem.classList.add("course-card");
                courseItem.innerHTML = `
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <small><i class="fas fa-calendar-alt"></i> Created on: ${new Date(course.created_at).toDateString()}</small>
                    <div class="course-actions">
                        <button class="view-students-btn btn" onclick="viewStudents(${course.id})">View Enrolled Students</button>
                        <button class="upload-btn btn" onclick="openUploadSection(${course.id})">Upload Materials</button>
                    </div>
                    <div id="student-list-${course.id}" class="student-list" style="display: none;"></div>
                    <div id="progress-section-${course.id}" class="progress-section" style="display: none;"></div>
                    <div id="upload-section-${course.id}" class="upload-section" style="display: none;"></div>
                `;
                courseList.appendChild(courseItem);
            });
        })
        .catch(error => {
            console.error("Error fetching courses:", error);
            courseList.innerHTML = "<p>Failed to load courses. Please try again later.</p>";
        });
});

function viewStudents(courseId) {
    localStorage.setItem("course_id", courseId);
    toggleStudentList(courseId);
}

function openProgressSection(courseId) {
    localStorage.setItem("course_id", courseId);
    toggleProgressSection(courseId);
}

function openUploadSection(courseId) {
    localStorage.setItem("course_id", courseId);
    toggleUploadSection(courseId);
}

async function toggleStudentList(courseId) {
    const studentList = document.getElementById(`student-list-${courseId}`);
    const progressSection = document.getElementById(`progress-section-${courseId}`);
    const uploadSection = document.getElementById(`upload-section-${courseId}`);

    progressSection.style.display = "none";
    uploadSection.style.display = "none";

    if (studentList.style.display === "none") {
        await fetchEnrolledStudents(courseId);
        studentList.style.display = "block";
    } else {
        studentList.style.display = "none";
    }
}

async function toggleProgressSection(courseId) {
    const progressSection = document.getElementById(`progress-section-${courseId}`);
    const studentList = document.getElementById(`student-list-${courseId}`);
    const uploadSection = document.getElementById(`upload-section-${courseId}`);

    studentList.style.display = "none";
    uploadSection.style.display = "none";

    if (progressSection.style.display === "none") {
        await showProgressSection(courseId);
        progressSection.style.display = "block";
    } else {
        progressSection.style.display = "none";
    }
}

async function fetchEnrolledStudents(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/instructor/course-students/${courseId}`);
        const students = await response.json();
        const studentList = document.getElementById(`student-list-${courseId}`);
        studentList.innerHTML = "";

        if (students.length === 0) {
            studentList.innerHTML = "<p>No students enrolled in this course.</p>";
            return;
        }

        const table = document.createElement("table");
        table.classList.add("enrolled-students-table");

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Midterm 1 (10)</th>
                    <th>Midterm 2 (10)</th>
                    <th>Assignment (5)</th>
                    <th>Presentation (5)</th>
                    <th>Quiz (5)</th>
                    <th>Total Classes</th>
                    <th>Absent</th>
                    <th>Attendance (5)</th>
                    <th>Submit</th>
                </tr>
            </thead>
            <tbody></tbody>
            <br>
            <a href="http://localhost:3000/download-incourse-pdf/${courseId}" target="_blank" >
            <button class="btn view-profile-btn">Download PDF</button>
            </a>

        `;

        const tbody = table.querySelector("tbody");

        for (const student of students) {
            const studentId = student.student_id || student.id;

            let marks = {};
            try {
                const marksResponse = await fetch(`http://localhost:3000/student-marks/${studentId}/${courseId}`);
                if (marksResponse.ok) {
                    marks = await marksResponse.json();
                }
            } catch (error) {
                console.warn(`No marks found for student ${studentId}`);
            }

            const row = document.createElement("tr");

            // Fallbacks
            const attendanceMarks = marks.attendance_marks || '';
            const totalClasses = marks.total_classes || '';
            const classesAbsent = marks.classes_absent || '';

            row.innerHTML = `
                <td>${studentId}</td>
                <td>${student.student_name}</td>

                ${["midterm_1", "midterm_2", "assignment", "presentation", "quiz_test"].map((key, idx) => {
                    const max = [10, 10, 5, 5, 5][idx];
                    const value = marks[key];
                    const inputId = `${key}-${studentId}`;
                    return `
                        <td>
                            <input 
                                type="number" 
                                id="${inputId}" 
                                min="0" 
                                max="${max}" 
                                step="0.5" 
                                value="${value !== null && value !== undefined ? value : ''}" 
                            >
                        </td>
                    `;
                }).join('')}

                <td><input type="number" id="total-${studentId}" min="0" value="${totalClasses}" onchange="calculateAttendance(${studentId})"></td>
                <td><input type="number" id="absent-${studentId}" min="0" value="${classesAbsent}" onchange="calculateAttendance(${studentId})"></td>
                <td><input type="number" id="att-${studentId}" readonly value="${attendanceMarks}"></td>

                <td><button class="btn" onclick="submitIncourseMarks(${studentId}, ${courseId})">Submit</button></td>
            `;

            tbody.appendChild(row);
        }

        studentList.appendChild(table);
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

function calculateAttendance(studentId) {
    const total = parseInt(document.getElementById(`total-${studentId}`).value);
    const absent = parseInt(document.getElementById(`absent-${studentId}`).value);
    const attInput = document.getElementById(`att-${studentId}`);

    if (isNaN(total) || total <= 0 || isNaN(absent) || absent < 0 || absent > total) {
        attInput.value = '';
        return;
    }

    const presentPercent = ((total - absent) / total) * 100;
    let marks = 0;

    if (presentPercent >= 90) marks = 5;
    else if (presentPercent >= 80) marks = 4.5;
    else if (presentPercent >= 70) marks = 4;
    else if (presentPercent >= 65) marks = 3.5;
    else if (presentPercent >= 60) marks = 3;
    else marks = 0;

    attInput.value = marks.toFixed(1);
}




function toggleUploadSection(courseId) {
    const uploadSection = document.getElementById(`upload-section-${courseId}`);
    const studentList = document.getElementById(`student-list-${courseId}`);
    const progressSection = document.getElementById(`progress-section-${courseId}`);

    studentList.style.display = "none";
    progressSection.style.display = "none";

    if (uploadSection.style.display === "none") {
        showUploadSection(courseId);
    } else {
        uploadSection.style.display = "none";
    }
}

function showUploadSection(courseId) {
    const uploadSection = document.getElementById(`upload-section-${courseId}`);
    uploadSection.innerHTML = `
        <h3>Upload Course Materials</h3>
        <form id="upload-form-${courseId}" enctype="multipart/form-data">
            <input type="file" name="file" accept=".pdf, .pptx, .jpg, .png, .jpeg, .ppt" required>
            <button type="submit" class="btn">Upload</button>
        </form>
        <div id="upload-feedback-${courseId}" class="upload-feedback"></div>
        <h3>Uploaded Materials</h3>
        <div id="materials-section-${courseId}" class="materials-section"></div>
    `;
    uploadSection.style.display = "block";
    fetchCourseMaterials(courseId);

    const uploadForm = document.getElementById(`upload-form-${courseId}`);
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        formData.append("courseId", courseId);

        try {
            const response = await fetch("http://localhost:3000/upload-course-file", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            Swal.fire({
                icon: response.ok ? 'success' : 'error',
                title: response.ok ? 'Uploaded' : 'Failed',
                text: result.message,
            });

            if (response.ok) {
                uploadForm.reset();
                fetchCourseMaterials(courseId);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            Swal.fire("Error", "File upload failed. Try again.", "error");
        }
    });
}

async function fetchCourseMaterials(courseId) {
    const materialsSection = document.getElementById(`materials-section-${courseId}`);
    try {
        const response = await fetch(`http://localhost:3000/course-materials/${courseId}`);
        const materials = await response.json();

        materialsSection.innerHTML = "";
        if (materials.length === 0) {
            materialsSection.innerHTML = "<p>No materials uploaded for this course yet.</p>";
            return;
        }

        materials.forEach(material => {
            const ext = material.file_path.split('.').pop().toLowerCase();
            let preview = "";
            if (["jpg", "png", "jpeg"].includes(ext)) {
                preview = `
                    <div class="preview-container">
                        <img src="http://localhost:3000/uploads/${material.file_name}" class="file-preview">
                        <button class="btn" onclick="closePreview(this)">Close</button>
                    </div>`;
            } else if (ext === "pdf") {
                preview = `
                    <div class="preview-container">
                        <iframe src="http://localhost:3000/uploads/${material.file_name}" class="file-preview"></iframe>
                        <button class="btn" onclick="openFullScreen('http://localhost:3000/uploads/${material.file_name}')">Full Screen</button>
                    </div>`;
            } else {
                preview = `<p>No preview available.</p>`;
            }

            materialsSection.innerHTML += `
                <div class="material-item">
                    <h4>${material.file_name}</h4>
                    ${preview}
                    <a href="http://localhost:3000/uploads/${material.file_name}" download class="btn">Download</a>
                </div>`;
        });
    } catch (error) {
        console.error("Error loading materials:", error);
        materialsSection.innerHTML = "<p>Could not load materials.</p>";
    }
}

async function submitIncourseMarks(studentId, courseId) {
    const fieldKeys = [
        { key: "midterm_1", label: "Midterm 1" },
        { key: "midterm_2", label: "Midterm 2" },
        { key: "assignment", label: "Assignment" },
        { key: "presentation", label: "Presentation" },
        { key: "quiz_test", label: "Quiz" }
    ];

    const marks = {};
    let totalMarks = 0;

    // Fetch in-course marks
    for (const { key } of fieldKeys) {
        const input = document.getElementById(`${key}-${studentId}`);
        let value = 0;

        if (input) {
            const parsed = parseFloat(input.value);
            value = isNaN(parsed) ? 0 : parsed;
        }

        marks[key] = value;
        totalMarks += value;
    }

    // Get attendance inputs with NaN handling
    const totalInput = document.getElementById(`total-${studentId}`);
    const absentInput = document.getElementById(`absent-${studentId}`);
    const attendanceInput = document.getElementById(`att-${studentId}`);

    const total_classes = totalInput ? (parseInt(totalInput.value) || 0) : 0;
    const classes_absent = absentInput ? (parseInt(absentInput.value) || 0) : 0;
    const attendance_marks = attendanceInput ? (parseFloat(attendanceInput.value) || 0) : 0;

    // Add attendance marks to total
    totalMarks += attendance_marks;

    // Build final object
    const payload = {
        student_id: studentId,
        course_id: courseId,
        ...marks,
        total_classes,
        classes_absent,
        attendance_marks,
        total_marks: totalMarks
    };

    try {
        const response = await fetch("http://localhost:3000/update-incourse-marks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: result.message || 'Marks submitted!',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire("Error", result.message || "Submission failed", "error");
        }
    } catch (error) {
        console.error("Submission error:", error);
        Swal.fire("Error", "Server error while submitting marks.", "error");
    }
}


async function showUserProfile(instructorId) {
    try {
        const response = await fetch(`http://localhost:3000/user-profile/${instructorId}`);
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
  const instructorId = document.getElementById('instructorId').textContent;
  showUserProfile(instructorId);
});


function updateUserProfile() {
    const instructorId = localStorage.getItem("instructor_id");

    fetch(`http://localhost:3000/user-profile/${instructorId}`)
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
                    fetch(`http://localhost:3000/update-profile/${instructorId}`, {
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

function closePreview(button) {
    button.parentElement.style.display = "none";
}

function openFullScreen(url) {
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
        Swal.fire("Notice", "Please allow pop-ups to view full-screen.", "info");
    }
}

function logout() {
    Swal.fire({
        title: 'Are you sure you want to log out?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, log out',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "login.html";
        }
    });
}
