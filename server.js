require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require("fs");



app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "LearnLogix",
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// Handle User Registration
app.post("/register", async (req, res) => {
  const { fullName, email, password, session, role } = req.body;

  if (!fullName || !email || !password || !session || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (fullname, email, password, session, role) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [fullName, email, hashedPassword, session, role], (err) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ message: "Registration failed." });
      }
      res.status(201).json({ message: "User registered successfully." });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Handle User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const sql = "SELECT * FROM users WHERE email = ? ";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Login failed." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or role." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  });
});



app.get('/user-profile/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    const sql = `
        SELECT id, fullname, email, role, session, mobile_number, address, dob, gender, blood_group, guardian_name, guardian_contact
        FROM users 
        WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user profile:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(results[0]);
    });
});

// Update profile
app.put('/update-profile/:id', (req, res) => {
    const { id } = req.params;
    const { fullname, email, mobile_number, address, dob, gender, blood_group, guardian_name, guardian_contact } = req.body;

    const query = `
        UPDATE users 
        SET fullname = ?, email = ?, mobile_number = ?, address = ?, dob = ?, gender = ?, 
            blood_group = ?, guardian_name = ?, guardian_contact = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [fullname, email, mobile_number, address, dob, gender, blood_group, guardian_name, guardian_contact, id],
        (err, result) => {
            if (err) {
                console.error("Error updating profile:", err);
                return res.status(500).send("Error updating profile");
            }
            res.send({ message: "Profile updated successfully!" });
        }
    );
});




// Handle Course Creation (Only Admins)
app.post("/create-course", (req, res) => {
  const { title, description, instructor_id } = req.body;

  // Validate input
  if (!title || !description || !instructor_id) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if the instructor exists and has the correct role
  db.query(
    "SELECT * FROM users WHERE id = ? AND role = 'instructor'",
    [instructor_id],
    (err, results) => {
      if (err) {
        console.error("Error checking instructor:", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (results.length === 0) {
        return res
          .status(403)
          .json({ message: "Unauthorized: Only instructors can be assigned to courses." });
      }

      // Start a transaction
      db.beginTransaction((err) => {
        if (err) {
          console.error("Error starting transaction:", err);
          return res.status(500).json({ message: "Internal server error." });
        }

        // Insert into Courses table only
        const courseSql =
          "INSERT INTO courses (title, description, instructor_id) VALUES (?, ?, ?)";
        db.query(courseSql, [title, description, instructor_id], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error creating course:", err);
              res.status(500).json({ message: "Failed to create course." });
            });
          }

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error committing transaction:", err);
                res.status(500).json({ message: "Internal server error." });
              });
            }

            // Success
            res.status(201).json({ message: "Course created successfully." });
          });
        });
      });
    }
  );
});


// Fetch All Courses for Students
app.get("/courses", (req, res) => {
  const sql = `
    SELECT courses.id, courses.title, courses.description, users.fullname AS instructor
    FROM courses 
    JOIN users ON courses.instructor_id = users.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res.status(500).json({ message: "Failed to fetch courses." });
    }
    res.json(results);
  });
});

// Fetch Courses assigned to a Specific Instructor
app.get("/instructor-courses/:instructor_id", (req, res) => {
  const { instructor_id } = req.params;

  const sql = "SELECT * FROM courses WHERE instructor_id = ?";
  db.query(sql, [instructor_id], (err, results) => {
    if (err) {
      console.error("Error fetching instructor courses:", err);
      return res.status(500).json({ message: "Failed to fetch courses." });
    }
    res.json(results);
  });
});



//student requests for course enrollment
app.post('/request-enrollment', (req, res) => {
  const { student_id, course_id } = req.body;

  const sql = "INSERT INTO enrollment_requests (student_id, course_id) VALUES (?, ?)";
  db.query(sql, [student_id, course_id], (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Enrollment request sent" });
  });
});

//Admin updates enrollment request status
app.post('/update-enrollment-status', (req, res) => {
  const { request_id, status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Update the status first
  const updateSql = "UPDATE enrollment_requests SET status = ? WHERE id = ?";
  db.query(updateSql, [status, request_id], (err, result) => {
    if (err) {
      console.error("Status update error:", err);
      return res.status(500).json({ message: "Database error during status update" });
    }

    // If approved, insert into enrollments and incourse_marks
    if (status === 'approved') {
      const selectSql = "SELECT student_id, course_id FROM enrollment_requests WHERE id = ?";
      db.query(selectSql, [request_id], (err, rows) => {
        if (err || rows.length === 0) {
          console.error("Select error:", err);
          return res.status(500).json({ message: "Error retrieving enrollment data" });
        }

        const { student_id, course_id } = rows[0];

        // Insert into enrollments table
        const insertEnrollment = "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)";
        db.query(insertEnrollment, [student_id, course_id], (err, result1) => {
          if (err) {
            console.error("Enrollment insert error:", err);
            return res.status(500).json({ message: "Failed to insert into enrollments" });
          }

          // Insert default row into incourse_marks
          const insertMarks = `
            INSERT INTO incourse_marks 
              (student_id, course_id, midterm_1, midterm_2, assignment, presentation, quiz_test) 
            VALUES (?, ?, NULL, NULL, NULL, NULL, NULL)
          `;
          db.query(insertMarks, [student_id, course_id], (err, result2) => {
            if (err) {
              console.error("Marks insert error:", err);
              return res.status(500).json({ message: "Failed to insert into incourse_marks" });
            }

            // All good
            return res.json({ message: "Enrollment approved and data inserted" });
          });
        });
      });
    } else {
      // Just return success for rejected case
      return res.json({ message: `Enrollment ${status}` });
    }
  });
});

//Admin Dashboard API to Fetch Requests
app.get('/get-enrollment-requests', (req, res) => {
  const sql = `SELECT er.id, u.fullname AS student_name, c.title AS course_name
               FROM enrollment_requests er
               JOIN users u ON er.student_id = u.id
               JOIN courses c ON er.course_id = c.id
               WHERE er.status = 'pending'`;

  db.query(sql, (err, results) => {
      if (err) {
          console.error("Database error:", err); // Add this for debugging
          return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results);
  });
});

//Check Enrollment status
app.get('/enrollment-status', (req, res) => {
  const { studentId, courseId } = req.query;

  const sql = `SELECT status FROM enrollment_requests 
               WHERE student_id = ? AND course_id = ? 
               ORDER BY id DESC LIMIT 1`;

  db.query(sql, [studentId, courseId], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.json({ status: "not_found" });
      res.json({ status: results[0].status });
  });
});



// **✅ Fetch Enrolled Courses for a Student**
app.get("/student-courses/:studentId", (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT courses.id, courses.title, courses.description, enrollments.enrolled_at
    FROM courses
    JOIN enrollments ON courses.id = enrollments.course_id
    WHERE enrollments.student_id = ?
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching enrolled courses:", err);
      return res.status(500).json({ message: "Failed to fetch enrolled courses." });
    }
    res.json(results);
  });
});

// Fetch admin statistics
app.get("/admin/stats", (req, res) => {
  const sql = `
      SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'student') AS totalStudents,
          (SELECT COUNT(*) FROM users WHERE role = 'instructor') AS totalInstructors,
          (SELECT COUNT(*) FROM courses) AS totalCourses
  `;
  db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch stats" });
      res.json(results[0]);
  });
});

// Fetch students
app.get("/admin/students", (req, res) => {
  db.query("SELECT id, fullname, email, role FROM users WHERE role = 'student'", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch students" });
      res.json(results);
  });
});

// Fetch instructors
app.get("/admin/instructors", (req, res) => {
  db.query("SELECT id, fullname, email, role FROM users WHERE role = 'instructor'", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch instructors" });
      res.json(results);
  });
});

app.get("/admin/active-instructors", (req, res) => {
  db.query("SELECT id, fullname, email, role FROM users WHERE role = 'instructor' AND status = 'Active'", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch instructors" });
      res.json(results);
  });
});

// Fetch all courses
app.get("/admin/courses", (req, res) => {
  const sql = `
      SELECT courses.id, courses.title, courses.description, users.fullname AS instructor
      FROM courses 
      JOIN users ON courses.instructor_id = users.id
  `;
  db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch courses" });
      res.json(results);
  });
});

//Fetch details of a single corse
app.get("/course/:id", (req, res) => {
    const courseId = req.params.id;
    const sql = `SELECT * FROM courses WHERE id = ?`;
    db.query(sql, [courseId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching course" });
        if (results.length === 0) return res.status(404).json({ message: "Course not found" });
        res.json(results[0]);
    });
});


// Delete student
app.delete("/admin/students/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM users WHERE id = ? AND role = 'student'", [id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to delete student." });
        res.json({ message: "Student deleted successfully." });
    });
});

// Delete course
app.delete("/admin/courses/:id", (req, res) => {
  const courseId = req.params.id;

  // First, delete enrollments
  const deleteEnrollments = "DELETE FROM enrollments WHERE course_id = ?";
  db.query(deleteEnrollments, [courseId], (err) => {
      if (err) {
          console.error("Error deleting enrollments:", err);
          return res.status(500).json({ message: "Failed to delete enrollments." });
      }

      // Then, delete the course
      const deleteCourse = "DELETE FROM courses WHERE id = ?";
      db.query(deleteCourse, [courseId], (err, result) => {
          if (err) {
              console.error("Error deleting course:", err);
              return res.status(500).json({ message: "Failed to delete course." });
          }

          if (result.affectedRows === 0) {
              return res.status(404).json({ message: "Course not found." });
          }

          res.json({ message: "Course and related enrollments deleted successfully." });
      });
  });
});

//Delete Instructor
app.delete("/admin/instructors/:instructorId", (req, res) => {
  const { instructorId } = req.params;
  const { newInstructorId } = req.body;

  if (!newInstructorId) {
      return res.status(400).json({ message: "New instructor ID is required." });
  }

  // Step 1: Check if the new instructor exists and is an instructor
  const checkNewInstructorQuery = "SELECT * FROM users WHERE id = ? AND role = 'instructor'";
  db.query(checkNewInstructorQuery, [newInstructorId], (err, results) => {
      if (err) {
          console.error("Error checking new instructor:", err);
          return res.status(500).json({ message: "Failed to check new instructor." });
      }

      if (results.length === 0) {
          return res.status(400).json({ message: "New instructor ID is invalid or not an instructor." });
      }

      // Step 2: Reassign courses to the new instructor
      const reassignCoursesQuery = "UPDATE courses SET instructor_id = ? WHERE instructor_id = ?";
      db.query(reassignCoursesQuery, [newInstructorId, instructorId], (err, results) => {
          if (err) {
              console.error("Error reassigning courses:", err);
              return res.status(500).json({ message: "Failed to reassign courses." });
          }

          // Step 3: Delete the instructor
          const deleteInstructorQuery = "DELETE FROM users WHERE id = ? AND role = 'instructor'";
          db.query(deleteInstructorQuery, [instructorId], (err, results) => {
              if (err) {
                  console.error("Error deleting instructor:", err);
                  return res.status(500).json({ message: "Failed to delete instructor." });
              }

              if (results.affectedRows === 0) {
                  return res.status(404).json({ message: "Instructor not found." });
              }

              res.json({ message: "Instructor deleted successfully." });
          });
      });
  });
});

//Fetch enrolled student for a course
app.get("/instructor/course-students/:courseId", (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT 
      users.id AS student_id, 
      users.fullname AS student_name, 
      enrollments.enrolled_at 
    FROM enrollments
    JOIN users ON enrollments.student_id = users.id
    WHERE enrollments.course_id = ?`;

  db.query(sql, [courseId], (err, results) => {
      if (err) {
          console.error("Error fetching enrolled students:", err);
          return res.status(500).json({ message: "Failed to fetch enrolled students." });
      }
      res.json(results);
  });
});


//Instructor updates student's incourse marks
app.post('/update-incourse-marks', (req, res) => {
  let { student_id, course_id, midterm_1, midterm_2, assignment, presentation, quiz_test, total_classes, classes_absent } = req.body;

  student_id = parseInt(student_id);
  course_id = parseInt(course_id);
  total_classes = parseInt(total_classes);
  classes_absent = parseInt(classes_absent);

  if (!student_id || !course_id) {
    return res.status(400).json({ message: "Student ID and Course ID are required" });
  }

  const selectQuery = `
    SELECT midterm_1, midterm_2, assignment, presentation, quiz_test, total_classes, classes_absent, attendance_marks 
    FROM incourse_marks 
    WHERE student_id = ? AND course_id = ? LIMIT 1
  `;

  db.query(selectQuery, [student_id, course_id], (err, results) => {
    if (err) {
      console.error("Error fetching existing marks:", err);
      return res.status(500).json({ message: "Failed to fetch existing marks" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "In-course marks record not found" });
    }

    const existing = results[0];

    // Use provided value if valid, else keep existing
    const updatedMarks = {
      midterm_1: isNaN(parseFloat(midterm_1)) ? existing.midterm_1 || 0 : parseFloat(midterm_1),
      midterm_2: isNaN(parseFloat(midterm_2)) ? existing.midterm_2 || 0 : parseFloat(midterm_2),
      assignment: isNaN(parseFloat(assignment)) ? existing.assignment || 0 : parseFloat(assignment),
      presentation: isNaN(parseFloat(presentation)) ? existing.presentation || 0 : parseFloat(presentation),
      quiz_test: isNaN(parseFloat(quiz_test)) ? existing.quiz_test || 0 : parseFloat(quiz_test),
      total_classes: isNaN(parseInt(total_classes)) ? existing.total_classes || 0 : parseInt(total_classes),
      classes_absent: isNaN(parseInt(classes_absent)) ? existing.classes_absent || 0 : parseInt(classes_absent),
      attendance_marks: 0
    };

    // Calculate attendance marks
    let attendance_marks = 0;
    if (total_classes && total_classes > 0) {
      const presentPercent = ((total_classes - classes_absent) / total_classes) * 100;
      if (presentPercent >= 90) attendance_marks = 5;
      else if (presentPercent >= 80) attendance_marks = 4.5;
      else if (presentPercent >= 70) attendance_marks = 4;
      else if (presentPercent >= 65) attendance_marks = 3.5;
      else if (presentPercent >= 60) attendance_marks = 3;
      else attendance_marks = 0;
    }

    // Add attendance to total
    const total_marks =
      updatedMarks.midterm_1 +
      updatedMarks.midterm_2 +
      updatedMarks.assignment +
      updatedMarks.presentation +
      updatedMarks.quiz_test +
      attendance_marks;

    // Calculate progress: 20% per non-zero item (including attendance)
    const gradedComponents = [
      updatedMarks.midterm_1,
      updatedMarks.midterm_2,
      updatedMarks.assignment,
      updatedMarks.presentation,
      updatedMarks.quiz_test,
      
    ];

    const nonZeroCount = gradedComponents.filter(val => val > 0).length;
    const progress = nonZeroCount * 20;

    const updateQuery = `
      UPDATE incourse_marks 
      SET midterm_1 = ?, midterm_2 = ?, assignment = ?, presentation = ?, quiz_test = ?, 
          total_classes = ?, classes_absent = ?, attendance_marks = ?, 
          total_marks = ?, progress = ?
      WHERE student_id = ? AND course_id = ?
    `;

    const values = [
      updatedMarks.midterm_1,
      updatedMarks.midterm_2,
      updatedMarks.assignment,
      updatedMarks.presentation,
      updatedMarks.quiz_test,
      total_classes,
      classes_absent,
      attendance_marks,
      total_marks,
      progress,
      student_id,
      course_id
    ];

    db.query(updateQuery, values, (err) => {
      if (err) {
        console.error("Error updating marks and progress:", err);
        return res.status(500).json({ message: "Failed to update marks and progress" });
      }

      res.json({ message: "Marks and progress updated successfully" });
    });
  });
});



app.get('/download-incourse-pdf/:courseId', (req, res) => {
  const { courseId } = req.params;

  const query = `
    SELECT s.id AS id, s.fullname AS student_name,
           m.midterm_1, m.midterm_2, m.assignment, m.presentation,
           m.quiz_test, m.attendance_marks, m.total_marks,
           c.title AS course_name
    FROM enrollments e
    JOIN users s ON s.id = e.student_id
    JOIN incourse_marks m ON m.student_id = s.id AND m.course_id = e.course_id
    JOIN courses c ON c.id = e.course_id
    WHERE e.course_id = ?
  `;

  db.query(query, [courseId], (err, results) => {
    if (err) {
      console.error("Error fetching marks:", err);
      return res.status(500).send("Error generating PDF");
    }

    const courseTitle = results[0]?.course_name || "Unknown Course";

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="incourse_marks.pdf"');

    doc.pipe(res);

    // 🔷 Header
    doc.fontSize(20).text("Department of Computer Science & Engineering", { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(16).text(`Course Title: ${courseTitle}`, { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(16).text(`Course Code: CSE-${courseId}`, { align: 'center' });
    doc.moveDown(1.0);
    doc.fontSize(16).text("In-Course Marks", { align: 'center' });
    doc.moveDown(1.0);

    // 🔷 Table Header
    const headerY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text("Student ID", 50, headerY);
    doc.text("Name", 110, headerY);
    doc.text("Mid-1", 240, headerY);
    doc.text("Mid-2", 280, headerY);
    doc.text("Assign.", 320, headerY);
    doc.text("Present.", 370, headerY);
    doc.text("Quiz", 420, headerY);
    doc.text("Attndan.", 460, headerY);
    doc.text("Total", 510, headerY);
    doc.moveTo(50, headerY + 12).lineTo(550, headerY + 12).stroke();

    // 🔷 Table Rows
    doc.font('Helvetica');
    let y = headerY + 18;

    results.forEach((row, idx) => {
      const sid = row.id?.toString() || "-";
      const name = row.student_name || "-";
      const m1 = row.midterm_1 ?? "-";
      const m2 = row.midterm_2 ?? "-";
      const asn = row.assignment ?? "-";
      const pres = row.presentation ?? "-";
      const quiz = row.quiz_test ?? "-";
      const attnd = row.attendance_marks ?? "-";
      const total = row.total_marks ?? "-";

      doc.text(sid, 50, y);
      doc.text(name, 110, y, { width: 120 });
      doc.text(m1.toString(), 240, y);
      doc.text(m2.toString(), 280, y);
      doc.text(asn.toString(), 320, y);
      doc.text(pres.toString(), 370, y);
      doc.text(quiz.toString(), 420, y);
      doc.text(attnd.toString(), 460, y);
      doc.text(total.toString(), 510, y);

      y += 20;

      // Handle page break
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
    });

    // 🔷 Signature
    doc.moveDown(5);
    doc.text("_________________________", 400);
    doc.text("Instructor Signature", 420);

    doc.end();
  });
});






//Fetch course wise incourse mark for student
app.get("/student-marks/:studentId/:courseId", (req, res) => {
  const { studentId, courseId } = req.params;

  const sql = `
      SELECT 
        midterm_1, 
        midterm_2, 
        assignment, 
        presentation, 
        quiz_test, 
        total_classes,
        classes_absent,
        attendance_marks,
        total_marks
      FROM incourse_marks
      WHERE student_id = ? AND course_id = ?
  `;

  db.query(sql, [studentId, courseId], (err, results) => {
      if (err) {
          console.error("Error fetching student marks:", err);
          return res.status(500).json({ message: "Failed to fetch student marks." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "Marks not found for this course." });
      }

      res.json(results[0]);
  });
});





// File storage setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
      cb(null, file.originalname); // original filename
  },
});

const upload = multer({ storage });

// Handle file upload
app.post("/upload-course-file", upload.single("file"), (req, res) => {
  const { courseId } = req.body; // Ensure the key matches what the frontend sends
  const filePath = req.file ? `uploads/${req.file.filename}` : null;
  const fileName = req.file.filename;

  // Validate courseId
  if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
  }

  // Validate file upload
  if (!filePath) {
      return res.status(400).json({ message: "File upload failed." });
  }
  if (!fileName) {
    return res.status(400).json({ message: "File upload failed." });
}

  // Insert into database
  const sql = "INSERT INTO course_materials (course_id, file_name, file_path) VALUES (?, ?, ?)";
  db.query(sql, [courseId, fileName, filePath], (err) => {
      if (err) {
          console.error("Error saving file:", err);
          return res.status(500).json({ message: "Failed to upload course file." });
      }
      res.status(201).json({ message: "File uploaded successfully." });
  });
});

// Fetch course materials for students
app.get("/course-materials/:courseId", (req, res) => {
  const { courseId } = req.params;
  const sql = "SELECT file_name, file_path FROM course_materials WHERE course_id = ?";

  db.query(sql, [courseId], (err, results) => {
      if (err) {
          console.error("Error fetching materials:", err);
          return res.status(500).json({ message: "Failed to fetch materials." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No materials found for this course." });
      }

      res.json(results);
  });
});


// Update course details
app.put("/update-course/:courseId", (req, res) => {
    const { courseId } = req.params;
    const { title, description, instructorId } = req.body;

    const sql = `
        UPDATE courses 
        SET title = ?, description = ?, instructor_id = ?
        WHERE id = ?`;

    db.query(sql, [title, description, instructorId, courseId], (err, result) => {
        if (err) {
            console.error("Error updating course:", err);
            return res.status(500).json({ message: "Failed to update course details." });
        }
        res.status(200).json({ message: "Course updated successfully!" });
    });
});

// ✅ Update user status
app.put('/update-status/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const query = `UPDATE users SET status = ? WHERE id = ?`;

    db.query(query, [status, id], (err, result) => {
        if (err) {
            console.error("Error updating status:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.json({ message: `Status updated to ${status} successfully!` });
    });
});





// Get course progress (For Instructor, Student, Admin)
app.get("/course-progress/:courseId", (req, res) => {
  const { courseId } = req.params;

  const selectQuery = `
    SELECT midterm_1, midterm_2, assignment, presentation, quiz_test, progress 
    FROM  incourse_marks
    WHERE course_id = ? LIMIT 1;`;

  db.query(selectQuery, [courseId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Course progress not found" });
    }
    res.json(results[0]);
  });
});

// POST /admin/issue-certificate/:courseId
app.post("/admin/issue-certificate/:courseId", (req, res) => {
    const { courseId } = req.params;

    // 1. Get all enrolled students + their progress
    const checkProgressSql = `
        SELECT u.id AS student_id, u.fullname, im.progress
        FROM incourse_marks im
        JOIN users u ON u.id = im.student_id
        WHERE im.course_id = ?
    `;

    db.query(checkProgressSql, [courseId], (err, students) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Database error." });
        }

        // 2. Check if any student has progress < 100
        const incomplete = students.filter(s => parseInt(s.progress) < 100);
        if (incomplete.length > 0) {
            return res.status(400).json({
                message: "Some students have not completed the course.",
                incompleteStudents: incomplete
            });
        }

        // 3. Get course name
        const courseNameSql = `SELECT title FROM courses WHERE id = ?`;
        db.query(courseNameSql, [courseId], (err, courseData) => {
            if (err || courseData.length === 0) {
                return res.status(500).json({ message: "Course not found." });
            }

            const courseName = courseData[0].title;
            const certificatesDir = path.join(__dirname, "certificates");
            if (!fs.existsSync(certificatesDir)) fs.mkdirSync(certificatesDir);

            // 4. Loop and generate certificates
            students.forEach(student => {
                const fileName = `${student.fullname.replace(/\s+/g, "_")}_${courseId}_${Date.now()}.pdf`;
                const filePath = path.join(certificatesDir, fileName);

                const doc = new PDFDocument({ size: "A4", layout: "landscape" });
                  doc.pipe(fs.createWriteStream(filePath));

                  // Background gradient effect
                  const pageWidth = doc.page.width;
                  const pageHeight = doc.page.height;
                  doc.rect(0, 0, pageWidth, pageHeight)
                    .fillColor("#f0f4f8")
                    .fill();

                  // Outer border
                  doc.lineWidth(6)
                    .strokeColor("#4a90e2")
                    .rect(20, 20, pageWidth - 40, pageHeight - 40)
                    .stroke();

                  // Inner border
                  doc.lineWidth(2)
                    .strokeColor("#d1e3f8")
                    .rect(35, 35, pageWidth - 70, pageHeight - 70)
                    .stroke();

                  // Title
                  doc.font("Helvetica-Bold")
                    .fontSize(48)
                    .fillColor("#2c3e50")
                    .text("Certificate of Completion", {
                        align: "center",
                        underline: true
                    });

                  // Spacer
                  doc.moveDown(2);

                  // Recipient name
                  doc.font("Helvetica-Bold")
                    .fontSize(36)
                    .fillColor("#34495e")
                    .text(student.fullname, { align: "center" });

                  // Subtext
                  doc.moveDown(0.5);
                  doc.font("Helvetica")
                    .fontSize(20)
                    .fillColor("#555")
                    .text("has successfully completed the course", { align: "center" });

                  // Course name
                  doc.moveDown(0.5);
                  doc.font("Helvetica-Bold")
                    .fontSize(28)
                    .fillColor("#1a5276")
                    .text(courseName, { align: "center" });

                  // Date
                  doc.moveDown(2);
                  doc.font("Helvetica-Oblique")
                    .fontSize(16)
                    .fillColor("#7f8c8d")
                    .text(
                        `Issued on: ${new Date().toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}`,
                        { align: "center" }
                    );

                  // Signature line
                  const signatureY = pageHeight - 120;
                  doc.moveTo(pageWidth - 250, signatureY)
                    .lineTo(pageWidth - 50, signatureY)
                    .strokeColor("#333")
                    .stroke();

                  doc.font("Helvetica")
                    .fontSize(14)
                    .fillColor("#333")
                    .text("Authorized Signature", pageWidth - 250, signatureY + 5, {
                        align: "center",
                        width: 200
                    });

                  // Optional logo
                  try {
                      doc.image("../images/logo.png", 50, pageHeight - 150, { width: 100 });
                  } catch (e) {
                      console.warn("Logo not found, skipping.");
                  }

                  doc.end();

                const relativePath = `/certificates/${fileName}`;
                const insertSql = `
                    INSERT INTO certificates (user_id, course_id, file_path) 
                    VALUES (?, ?, ?)
                `;
                db.query(insertSql, [student.student_id, courseId, relativePath], (err) => {
                    if (err) console.error(`Error saving certificate for ${student.fullname}:`, err);
                });
            });

            res.json({ message: "Certificates issued successfully." });
        });
    });
});


// GET /student/certificates/:userId
app.get("/student/certificates/:userId", (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT c.id, c.file_path, c.issued_at, co.title AS course_name
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        WHERE c.user_id = ?
        ORDER BY c.issued_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching certificates:", err);
            return res.status(500).json({ message: "Error fetching certificates." });
        }
        res.json(results);
    });
});



// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
