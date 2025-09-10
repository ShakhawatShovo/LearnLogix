document.addEventListener("DOMContentLoaded", () => {
    loadStats();
    loadEnrollmentRequests();
});

// ✅ Fetch and Display Dashboard Stats
async function loadStats() {
    try {
        const response = await fetch("http://localhost:3000/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch statistics");

        const stats = await response.json();
        document.getElementById("total-students").textContent = stats.totalStudents;
        document.getElementById("total-instructors").textContent = stats.totalInstructors;
        document.getElementById("total-courses").textContent = stats.totalCourses;
    } catch (error) {
        console.error("Error loading statistics:", error);
    }
}

// ✅ Fetch and Display Enrollment Requests
async function loadEnrollmentRequests() {
    try {
        const response = await fetch("http://localhost:3000/get-enrollment-requests");
        const data = await response.json();

        const tableBody = document.getElementById("requests-table");
        tableBody.innerHTML = "";

        data.forEach(req => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${req.student_name}</td>
                <td>${req.course_name}</td>
                <td>
                    <button class="approve-btn btn" onclick="updateStatus(${req.id}, 'approved')">Approve</button>
                    <button class="reject-btn btn" onclick="updateStatus(${req.id}, 'rejected')">Reject</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading enrollment requests:", error);
    }
}

// ✅ Approve or Reject Enrollment Requests
async function updateStatus(requestId, status) {
    try {
        const response = await fetch("http://localhost:3000/update-enrollment-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request_id: requestId, status })
        });

        const result = await response.json();

        Swal.fire({
            icon: 'success',
            title: result.message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });

        loadEnrollmentRequests();
    } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire("Error", "Something went wrong.", "error");
    }
}

function showStats() {
    location.reload();
}

function showStudents() {
    resetSections();
    document.getElementById("student-section").classList.remove("hidden");
    fetchAndDisplay("students", "student-list");
}

function showInstructors() {
    resetSections();
    document.getElementById("instructor-section").classList.remove("hidden");
    fetchAndDisplay("instructors", "instructor-list");
}

function showCourses() {
    resetSections();
    document.getElementById("course-section").classList.remove("hidden");
    fetchAndDisplay("courses", "course-list");
}

function showEnrollmentRequests() {
    resetSections();
    document.getElementById("enrollment-section").classList.remove("hidden");
    loadEnrollmentRequests();
}

function resetSections() {
    document.querySelectorAll(".main-content section").forEach(section => {
        section.classList.add("hidden");
    });
}

// ✅ Fetch and Display Students, Instructors, Courses
async function fetchAndDisplay(type, listId) {
    const list = document.getElementById(listId);
    list.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(`http://localhost:3000/admin/${type}`);
        const data = await response.json();

        list.innerHTML = data.map(item => {
            const isUser = (type === "students" || type === "instructors");
            return `
                <div class="card">
                    <h3>${item.fullname || item.title}</h3>
                    <h3>ID: ${item.id}</h3>
                    <p>${item.email ? `Email: ${item.email}` : item.description}</p>

                    <button class="delete-btn btn" onclick="deleteItem('${type}', ${item.id})">Delete</button>

                    ${type === "courses" ? `
                        <button class="update-btn btn" onclick="updateCourse(${item.id})">Update</button>
                        <button class="progress-btn btn" onclick="fetchCourseProgress(${item.id})">View Progress</button>
                        <button class="progress-btn btn" onclick="issueCertificate(${item.id})">Issue Certificate</button>
                    ` : ""}

                    ${isUser ? `
                        <button class="view-btn btn" onclick="viewUserProfile(${item.id})">View Profile</button>
                        <button class="status-btn btn" 
                                data-id="${item.id}" 
                                data-status="${item.status}" 
                                data-type="${type}"
                                onclick="toggleUserStatus(this)">
                            ${item.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                    ` : ""}

                </div>
            `;
        }).join("");

    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        list.innerHTML = `<p>Failed to load ${type}.</p>`;
    }
}

// ✅ View Profile function
async function viewUserProfile(userId) {
    try {
        const res = await fetch(`http://localhost:3000/user-profile/${userId}`);
        const user = await res.json();

        let extraFields = '';

        if (user.role === 'student') {
            extraFields += `
                <p><b>Guardian Name:</b> ${user.guardian_name || "N/A"}</p>
                <p><b>Guardian Contact:</b> ${user.guardian_contact || "N/A"}</p>
                <p><b>Session:</b> ${user.session || "N/A"}</p>
            `;
        } 
        else if (user.role === 'instructor') {
            // Instructor won't have session displayed
            extraFields += '';
        }

        Swal.fire({
            title: user.fullname,
            html: `
                <div style="text-align: left; font-size: 20px; padding: 10px;">
                    <p><b>Email:</b> ${user.email}</p>
                    <p><b>Mobile:</b> ${user.mobile_number || "N/A"}</p>
                    <p><b>Address:</b> ${user.address || "N/A"}</p>
                    <p><b>Blood Group:</b> ${user.blood_group || "N/A"}</p>
                    <p><b>Gender:</b> ${user.gender || "N/A"}</p>
                    ${extraFields}
                </div>
            `,
            icon: 'info'
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}


// Toggle User Status using element dataset
async function toggleUserStatus(button) {
    const userId = button.dataset.id;
    const currentStatus = button.dataset.status;
    const type = button.dataset.type;

    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
        const res = await fetch(`http://localhost:3000/update-status/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await res.json();
        Swal.fire("Success", data.message, "success");

        // Update button immediately without waiting for re-fetch
        button.dataset.status = newStatus;
        button.textContent = newStatus === "Active" ? "Deactivate" : "Activate";

    } catch (error) {
        console.error("Error updating status:", error);
    }
}




// ✅ Delete Item with Confirmation Modal
async function deleteItem(type, id) {
    const result = await Swal.fire({
        title: `Delete this ${type.slice(0, -1)}?`,
        text: "This action is irreversible!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    try {
        let response;

        if (type === "instructors") {
            const { value: newInstructorId } = await Swal.fire({
                title: "Enter new instructor ID",
                input: "number",
                inputLabel: "To reassign courses before deletion",
                inputPlaceholder: "e.g., 314159",
                showCancelButton: true
            });

            if (!newInstructorId) {
                Swal.fire("Cancelled", "Instructor deletion was cancelled", "info");
                return;
            }

            response = await fetch(`http://localhost:3000/admin/${type}/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newInstructorId })
            });
        } else {
            response = await fetch(`http://localhost:3000/admin/${type}/${id}`, { method: "DELETE" });
        }

        const result = await response.json();

        Swal.fire("Deleted!", result.message, "success");
        loadStats();
        fetchAndDisplay(type, `${type}-list`);
    } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error", "Failed to delete.", "error");
    }
}

// ✅ Update Course with Modal Inputs
async function updateCourse(courseId) {
    try {
        // 1️⃣ Fetch current course details
        const courseRes = await fetch(`http://localhost:3000/course/${courseId}`);
        const course = await courseRes.json();

        // 2️⃣ Fetch list of instructors
        const instructorRes = await fetch(`http://localhost:3000/admin/active-instructors`);
        const instructors = await instructorRes.json();

        // 3️⃣ Build instructor dropdown options
        const instructorOptions = instructors.map(inst => `
            <option value="${inst.id}" ${inst.id === course.instructor_id ? "selected" : ""}>
                ${inst.fullname}
            </option>
        `).join("");

        // 4️⃣ Show SweetAlert with pre-filled values
        const { value: formValues } = await Swal.fire({
            title: "Update Course Info",
            html:
                `<input id="title" class="swal2-input" placeholder="Course Title" value="${course.title}">` +
                `<input id="description" class="swal2-input" placeholder="Course Description" value="${course.description}">` +
                `<select id="instructorId" class="swal2-input">${instructorOptions}</select>`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const title = document.getElementById("title").value.trim();
                const description = document.getElementById("description").value.trim();
                const instructorId = document.getElementById("instructorId").value;

                if (!title || !description || !instructorId) {
                    Swal.showValidationMessage("All fields are required");
                }

                return { title, description, instructorId };
            }
        });

        // 5️⃣ Stop if canceled
        if (!formValues) return;

        // 6️⃣ Send update request
        const response = await fetch(`http://localhost:3000/update-course/${courseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues)
        });

        const result = await response.json();
        Swal.fire("Updated!", result.message, "success");

        if (response.ok) {
            loadStats();
            fetchAndDisplay("courses", "course-list");
        }

    } catch (error) {
        console.error("Error updating course:", error);
        Swal.fire("Error", "Update failed.", "error");
    }
}


// ✅ Show Course Progress with Modal
async function fetchCourseProgress(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/course-progress/${courseId}`);
        const progress = await response.json();

        Swal.fire({
            title: `Course Progress`,
            html: `
                <ul style="text-align:left; font-size:16px;">
                    <li><strong>Midterm 1:</strong> ${progress.midterm_1 > 0 ? "✅ Completed" : "❌ Pending"}</li>
                    <li><strong>Midterm 2:</strong> ${progress.midterm_2 > 0 ? "✅ Completed" : "❌ Pending"}</li>
                    <li><strong>Assignment:</strong> ${progress.assignment > 0 ? "✅ Completed" : "❌ Pending"}</li>
                    <li><strong>Presentation:</strong> ${progress.presentation > 0 ? "✅ Completed" : "❌ Pending"}</li>
                    <li><strong>Quiz/Class test:</strong> ${progress.quiz_test > 0 ? "✅ Completed" : "❌ Pending"}</li>
                    <li style="margin-top: 10px;"><strong>Overall Progress:</strong> ${progress.progress || 0}%</li>
                </ul>
            `
        });
    } catch (error) {
        console.error("Error fetching progress:", error);
        Swal.fire("Error", "Failed to load course progress.", "error");
    }
}


function issueCertificate(courseId) {
    fetch(`http://localhost:3000/admin/issue-certificate/${courseId}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => {
        if (data.incompleteStudents && data.incompleteStudents.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Course Not Completed',
                html: `
                    <p>Some students have not completed the course!</p>
                `,
                confirmButtonText: 'OK',
                confirmButtonColor: '#f39c12'
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Certificates Issued',
                text: 'Certificates have been successfully issued.',
                confirmButtonColor: '#28a745'
            });
        }

    })
    .catch(err => console.error(err));
}


// ✅ Logout Function
function logout() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out of your session.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "login.html";
        }
    });
}

