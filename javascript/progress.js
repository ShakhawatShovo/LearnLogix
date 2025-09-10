document.addEventListener('DOMContentLoaded', async () => {
  // Get student info from localStorage
  const studentId = localStorage.getItem("student_id");
  const studentName = localStorage.getItem("student_name") || "Student";
  document.getElementById("studentName").textContent = studentName;

  if (!studentId) {
    alert("Student ID not found. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  try {
    // Fetch student's courses
    const response = await fetch(`http://localhost:3000/student-courses/${studentId}`);
    const courses = await response.json();

    if (!Array.isArray(courses) || courses.length === 0) {
      document.querySelector(".charts-container").innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open"></i>
          <h3>No Enrolled Courses</h3>
          <p>You are not currently enrolled in any courses.</p>
          <a href="courses.html" class="btn">Browse Courses</a>
        </div>
      `;
      return;
    }

    const courseTitles = [];
    const progressData = [];
    const gradesData = [];

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    // Process each course
    for (const course of courses) {
      courseTitles.push(course.title);

      // Fetch course progress
      const progressRes = await fetch(`http://localhost:3000/course-progress/${course.id}`);
      const progressJson = await progressRes.json();
      const progress = progressJson.progress || 0;
      progressData.push(progress);

      // Categorize progress
      if (progress >= 90) completed++;
      else if (progress > 0) inProgress++;
      else notStarted++;

      // Fetch in-course marks
      const marksRes = await fetch(`http://localhost:3000/student-marks/${studentId}/${course.id}`);
      const marksJson = await marksRes.json();
      const totalMarks = marksJson.total_marks || 0;
      gradesData.push(totalMarks);
    }

    // Course Completion Pie Chart with modern styling
    const completionCtx = document.getElementById('completionChart').getContext('2d');
    new Chart(completionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Completed ', 'In Progress', 'Not Started'],
        datasets: [{
          data: [completed, inProgress, notStarted],
          backgroundColor: [
            '#4CAF50', // Green
            '#FFC107', // Amber
            '#F44336'  // Red
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                family: 'Poppins',
                size: 12
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} course${value !== 1 ? 's' : ''} (${percentage}%)`;
              }
            },
            bodyFont: {
              family: 'Poppins',
              size: 13
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });

    // Grades Bar Chart with modern styling
    const gradesCtx = document.getElementById('gradesChart').getContext('2d');
    new Chart(gradesCtx, {
      type: 'bar',
      data: {
        labels: courseTitles,
        datasets: [{
          label: 'Total Mark',
          data: gradesData,
          backgroundColor: '#00C4CC',
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: '#00A8B0'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 40,
            grid: {
              drawBorder: false,
              color: '#f0f0f0'
            },
            ticks: {
              font: {
                family: 'Poppins'
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Poppins'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Grade: ${context.raw}/40`;
              }
            },
            bodyFont: {
              family: 'Poppins',
              size: 13
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });

    // Add loading animation while charts render
    document.querySelectorAll('.chart-card').forEach(card => {
      card.classList.add('chart-loaded');
    });

  } catch (error) {
    console.error("Error loading progress data:", error);
    document.querySelector(".charts-container").innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Data</h3>
        <p>Failed to load progress information. Please try again later.</p>
        <button class="btn" onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }
});

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}