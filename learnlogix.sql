-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 30, 2025 at 01:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learnlogix`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `instructor_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `instructor_id`, `created_at`) VALUES
(1109, 'Software Engineering Lab', 'Get your hands dirty with real-world software projects! Collaborate in teams, harness version control systems, and apply industry best practices to create, test, and refine functional software solutions from concept to deployment.', 314164, '2025-03-16 10:48:26'),
(1110, 'Software Engineering (SWE)', 'Master the art and science of building robust, scalable software systems. Dive into software lifecycle models, agile methodologies, and cutting-edge tools to design, develop, and deploy high-quality applications that solve real-world problems.', 314164, '2025-03-16 10:57:37'),
(1111, 'Operating System (OS)', 'Unlock the core of computing! Explore the inner workings of operating systems—process scheduling, memory management, file systems, and security—and learn how they orchestrate hardware and software to power modern applications.', 314165, '2025-03-16 11:02:32'),
(1112, 'Compiler Design', 'Become a language architect! Delve into the fascinating world of compilers, from lexical analysis to code optimization. Learn how to transform high-level code into efficient machine language, bridging the gap between human and machine.', 314166, '2025-03-16 11:03:31'),
(1113, 'Compiler Design Lab', 'Build your own compiler! Gain hands-on experience crafting lexical analyzers, parsers, and code generators. Turn theoretical concepts into a fully functional compiler for a custom programming language.', 314166, '2025-03-16 11:06:18'),
(1114, 'Technical Writing', 'Craft compelling technical narratives! Develop the skills to write clear, concise, and impactful documents—reports, proposals, manuals, and research papers—tailored to diverse audiences. Elevate your communication to inspire and inform.', 314162, '2025-03-16 11:07:26'),
(1115, 'Data Science', 'Unleash the power of data! Learn to collect, clean, analyze, and visualize data to uncover hidden insights. Harness machine learning and statistical techniques to drive data-driven decisions and solve complex problems.', 314165, '2025-03-16 11:08:47');

-- --------------------------------------------------------

--
-- Table structure for table `course_materials`
--

CREATE TABLE `course_materials` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_materials`
--

INSERT INTO `course_materials` (`id`, `course_id`, `file_name`, `file_path`, `uploaded_at`) VALUES
(8, 1109, 'Data Flow Diagram_ Student Enrollment System.pdf', 'uploads/Data Flow Diagram_ Student Enrollment System.pdf', '2025-03-18 06:00:41'),
(9, 1111, 'Process Synchronization.pdf', 'uploads/Process Synchronization.pdf', '2025-03-18 06:03:33'),
(10, 1111, 'Deadlock.pdf', 'uploads/Deadlock.pdf', '2025-03-18 06:03:41'),
(15, 1109, 'Class Diagram.pdf', 'uploads/Class Diagram.pdf', '2025-03-23 14:53:34'),
(16, 1110, 'Sample Class Diagram.png', 'uploads/Sample Class Diagram.png', '2025-04-04 15:16:30'),
(19, 1115, 'Data Flow Diagram.png', 'uploads/Data Flow Diagram.png', '2025-04-07 17:35:47'),
(20, 1111, 'CPU Scheduling Codes.pdf', 'uploads/CPU Scheduling Codes.pdf', '2025-04-16 04:53:50'),
(21, 1111, 'Memory Management.pdf', 'uploads/Memory Management.pdf', '2025-04-16 05:40:40'),
(22, 1111, 'Memory Management part 2.pptx', 'uploads/Memory Management part 2.pptx', '2025-04-16 05:42:24'),
(23, 1111, 'Introduction and OS Structure.pdf', 'uploads/Introduction and OS Structure.pdf', '2025-04-16 05:45:25'),
(24, 1112, 'Lecture 01.pdf', 'uploads/Lecture 01.pdf', '2025-04-16 05:49:07'),
(25, 1112, 'Lexical Analysis-Part_1.pdf', 'uploads/Lexical Analysis-Part_1.pdf', '2025-04-16 05:51:34'),
(26, 1112, 'Lexical Analysis-Part-2.pdf', 'uploads/Lexical Analysis-Part-2.pdf', '2025-04-16 05:53:07'),
(27, 1112, 'Lexical_Error.ppt', 'uploads/Lexical_Error.ppt', '2025-04-16 05:55:23'),
(28, 1112, 'Parsing Part -I.pptx', 'uploads/Parsing Part -I.pptx', '2025-04-16 05:57:06'),
(29, 1112, 'Parsing Part -II.pdf', 'uploads/Parsing Part -II.pdf', '2025-04-16 06:01:23');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `course_id`, `student_id`, `enrolled_at`) VALUES
(7, 1115, 314175, '2025-04-04 05:54:32'),
(8, 1111, 314170, '2025-04-04 06:15:02'),
(9, 1110, 314175, '2025-04-04 06:21:43'),
(10, 1109, 314170, '2025-04-04 12:49:35'),
(12, 1109, 314175, '2025-04-04 12:52:26'),
(13, 1109, 314174, '2025-04-04 12:52:32'),
(14, 1115, 314170, '2025-04-07 13:49:34'),
(15, 1112, 314170, '2025-04-07 14:17:23'),
(16, 1110, 314174, '2025-04-07 15:20:07'),
(17, 1111, 314174, '2025-04-07 17:19:15'),
(18, 1112, 314174, '2025-04-07 17:20:58'),
(19, 1114, 314170, '2025-04-07 17:47:56'),
(20, 1113, 314170, '2025-04-07 18:02:10'),
(21, 1109, 314177, '2025-04-12 16:10:38'),
(22, 1112, 314177, '2025-04-12 16:12:15'),
(23, 1115, 314174, '2025-04-15 13:59:53'),
(24, 1112, 314175, '2025-04-16 05:20:40'),
(25, 1111, 314175, '2025-04-16 05:21:01');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_requests`
--

CREATE TABLE `enrollment_requests` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `request_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollment_requests`
--

INSERT INTO `enrollment_requests` (`id`, `student_id`, `course_id`, `status`, `request_date`) VALUES
(5, 314175, 1109, 'rejected', '2025-04-01 17:30:39'),
(6, 314175, 1110, 'approved', '2025-04-01 17:30:44'),
(10, 314170, 1111, 'approved', '2025-04-04 06:14:46'),
(11, 314170, 1112, 'rejected', '2025-04-04 06:15:32'),
(12, 314170, 1112, 'approved', '2025-04-04 06:17:25'),
(13, 314175, 1111, 'rejected', '2025-04-04 06:21:07'),
(14, 314170, 1109, 'approved', '2025-04-04 12:48:49'),
(15, 314170, 1110, 'rejected', '2025-04-04 12:48:53'),
(16, 314175, 1109, 'approved', '2025-04-04 12:51:17'),
(17, 314174, 1109, 'approved', '2025-04-04 12:51:44'),
(18, 314174, 1110, 'rejected', '2025-04-04 12:51:49'),
(19, 314174, 1110, 'approved', '2025-04-04 12:53:52'),
(20, 314170, 1115, 'approved', '2025-04-07 13:49:17'),
(21, 314174, 1111, 'approved', '2025-04-07 15:20:48'),
(22, 314174, 1112, 'approved', '2025-04-07 17:20:01'),
(23, 314174, 1113, 'rejected', '2025-04-07 17:20:05'),
(24, 314170, 1114, 'approved', '2025-04-07 17:47:46'),
(25, 314170, 1113, 'rejected', '2025-04-07 18:01:30'),
(26, 314170, 1113, 'approved', '2025-04-07 18:02:00'),
(27, 314177, 1110, 'rejected', '2025-04-12 16:06:41'),
(28, 314177, 1109, 'approved', '2025-04-12 16:10:28'),
(29, 314177, 1112, 'approved', '2025-04-12 16:12:09'),
(30, 314174, 1113, 'rejected', '2025-04-12 17:25:11'),
(31, 314174, 1113, 'rejected', '2025-04-12 17:25:56'),
(32, 314175, 1111, 'approved', '2025-04-12 18:26:20'),
(33, 314175, 1114, 'pending', '2025-04-12 18:26:26'),
(34, 314175, 1115, 'rejected', '2025-04-12 18:27:02'),
(35, 314177, 1110, 'rejected', '2025-04-12 19:04:37'),
(36, 314177, 1114, 'rejected', '2025-04-12 19:04:41'),
(37, 314174, 1114, 'pending', '2025-04-12 19:05:09'),
(38, 314174, 1113, 'pending', '2025-04-12 19:05:13'),
(39, 314174, 1115, 'approved', '2025-04-15 13:58:52'),
(40, 314175, 1112, 'approved', '2025-04-16 05:03:57'),
(41, 314175, 1115, 'pending', '2025-04-16 05:04:07'),
(42, 314170, 1110, 'pending', '2025-04-16 06:06:46');

-- --------------------------------------------------------

--
-- Table structure for table `incourse_marks`
--

CREATE TABLE `incourse_marks` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `midterm_1` float DEFAULT NULL,
  `midterm_2` float DEFAULT NULL,
  `assignment` float DEFAULT NULL,
  `presentation` float DEFAULT NULL,
  `quiz_test` float DEFAULT NULL,
  `total_marks` int(11) DEFAULT 0,
  `progress` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `incourse_marks`
--

INSERT INTO `incourse_marks` (`id`, `student_id`, `course_id`, `midterm_1`, `midterm_2`, `assignment`, `presentation`, `quiz_test`, `total_marks`, `progress`) VALUES
(1, 314175, 1115, 8, 6, 4, 0, 0, 18, 60),
(2, 314170, 1111, 9, 10, 5, 0, 0, 24, 60),
(3, 314175, 1110, 6, 0, 0, 0, 0, 6, 20),
(4, 314170, 1109, 6, 10, 0, 0, 0, 16, 40),
(5, 314170, 1110, 6, 0, 0, 0, 0, 6, 20),
(6, 314175, 1109, 6, 8, 0, 0, 0, 14, 40),
(7, 314174, 1109, 9, 7, 0, 0, 0, 16, 40),
(8, 314170, 1115, 9, 10, 5, 0, 0, 24, 60),
(9, 314170, 1112, 0, 0, 0, 0, 0, 0, 0),
(10, 314174, 1110, 9, 0, 0, 0, 0, 9, 20),
(11, 314174, 1111, 8, 9, 3, 0, 0, 20, 60),
(12, 314174, 1112, NULL, NULL, NULL, NULL, NULL, 0, 0),
(13, 314170, 1114, NULL, NULL, NULL, NULL, NULL, 0, 0),
(14, 314170, 1113, 0, 0, 0, 0, 0, 0, 0),
(15, 314177, 1109, 5, 5, 0, 0, 0, 10, 40),
(16, 314177, 1112, NULL, NULL, NULL, NULL, NULL, 0, 0),
(17, 314174, 1115, 8, 9, 4, 0, 0, 21, 60),
(18, 314175, 1112, NULL, NULL, NULL, NULL, NULL, 0, 0),
(19, 314175, 1111, 7, 5, 4, 0, 0, 16, 60);

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int(11) NOT NULL,
  `Course_ID` int(11) NOT NULL,
  `midterm_1` tinyint(1) DEFAULT 0,
  `midterm_2` tinyint(1) DEFAULT 0,
  `assignment` tinyint(1) DEFAULT 0,
  `presentation` tinyint(1) DEFAULT 0,
  `progress_percentage` int(11) DEFAULT 0,
  `quiz` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `progress`
--

INSERT INTO `progress` (`id`, `Course_ID`, `midterm_1`, `midterm_2`, `assignment`, `presentation`, `progress_percentage`, `quiz`) VALUES
(2, 1109, 1, 1, 1, 1, 80, 0),
(3, 1110, 1, 1, 0, 0, 40, 0),
(4, 1111, 1, 0, 0, 0, 20, 0),
(5, 1112, 1, 1, 1, 1, 100, 0),
(6, 1113, 0, 1, 0, 1, 50, 0),
(7, 1114, 0, 0, 1, 0, 25, 0),
(8, 1115, 1, 0, 0, 0, 20, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','instructor','admin') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `role`) VALUES
(11, 'Shakhawat Hosen Chowdhury Shovo', 'shakhawatshovo8520@gmail.com', '$2b$10$pbdftlEu/qyjcbVdiYa54uMz46L.yuggsz2khDlr/UgPxYWAcUD4G', 'admin'),
(314160, 'Dr. Mahmudul Hasan', 'mahmudul1234@gmail.com', '$2b$10$rs21Z2rw/cozuiCC9sFFzO.cxFKWr7zkaERzxmVRYfYL.Ftu96dES', 'instructor'),
(314161, 'Md. Faisal Bin Abdul Aziz', 'faisal1234@gmail.com', '$2b$10$9selrSYqIM4H3F0s9Bf4juw1TVEPs3mE58a20HSbx4nHfVpoGnNIa', 'instructor'),
(314162, 'Partha Chakraborty', 'partha1234@gmail.com', '$2b$10$uYIupTP1u3xGcMYSGDvhz.TWX7gtlgWH/fVbVYSzV98XozdP8Expe', 'instructor'),
(314163, 'Khairun Nahar', 'khairunnahar1234@gmail.com', '$2b$10$pquo.wf8OBu7r/GCC1bXveA1Yr7yw4Zhjy8hvwLCUXN2gd19V9ezu', 'instructor'),
(314164, 'Mahmuda Khatun', 'mahmuda1234@gmail.com', '$2b$10$z5RaIwNNxZh91paTbp0bQOrQs6/ETeUzLaV54yYXMkMnljaP.RaSu', 'instructor'),
(314165, 'Md. Zahidur Rahman', 'zahid1234@gmail.com', '$2b$10$cC6opKgKvu7CxVWUKXvQ..p3bKf6raYW8ZIxdx9RCv.aeFiTj5S9u', 'instructor'),
(314166, 'Jahirul Islam Babar', 'babar1234@gmail.com', '$2b$10$W1RaHjhJwkGQwN0Cq1vzAOnW6OL4EDnR4juyCFM52GnpiTisw6h..', 'instructor'),
(314167, 'Md. Atiqur Rahman', 'atiq1234@gmail.com', '$2b$10$SYDhme5r0HNkrnq1NQFNFOllfIMhz7CURCr6OI1V0BngPi30dMlfq', 'instructor'),
(314168, 'Md. Khalil Ahmed', 'khalil1234@gmail.com', '$2b$10$7iY85/O.FGDTLXmuhNDqLejqDlnVoRrzOZwUyIjZPRxMZhXdJuPYy', 'instructor'),
(314169, 'Md. Muhibullah', 'muhib1234@gmail.com', '$2b$10$ox4zIN2oVYR0JD/1VRRfoO99r5fuedRvKBXtse0Zsht8WsxjsTBcK', 'instructor'),
(314170, 'Shakhawat Shovo', 'shakhawatshovo123@gmail.com', '$2b$10$FiSu1xFnTZPcdQ0ZuFraAenFWiI1b2ZKcrgRzvKhZIJd0OA29MOXW', 'student'),
(314174, 'Shamim Hasan', 'shamim4356@gmail.com', '$2b$10$874YVBrBpvEujvgUhfwJzuBQfgdBW4vpvgerc9sx0CtQFCgjWRq/W', 'student'),
(314175, 'Abu Kalam', 'kalam51213@gmail.com', '$2b$10$ejP9k5MTgwvuRzgUG7oyMugG9EbGr0.rLWAGO57hgTsYEOM/1zrBm', 'student'),
(314177, 'Tanjil mahmud', 'tanjil123@gmail.com', '$2b$10$K3T5sGDTwppF.Gka29Z0l.2TVS5MXdMOi5/QXcKePs9WMZkXoFmwW', 'student'),
(314180, 'Tanvir Mahmud Himel', 'himel123@gmail.com', '$2b$10$aaAAK/950PXXcbd13RG.SepLopcmaH8PTiMKiFRFMMP6Tya9YK83C', 'student'),
(314181, 'Shoriful Islam', 'shorif456@gmail.com', '$2b$10$yNe/NOAIUktyQNmZxSOcVu8.z3CxceRhyKYR1xGh6tBOYJxKk5kgq', 'student');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `course_materials`
--
ALTER TABLE `course_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `enrollment_requests`
--
ALTER TABLE `enrollment_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `incourse_marks`
--
ALTER TABLE `incourse_marks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Course_ID` (`Course_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1116;

--
-- AUTO_INCREMENT for table `course_materials`
--
ALTER TABLE `course_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `enrollment_requests`
--
ALTER TABLE `enrollment_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `incourse_marks`
--
ALTER TABLE `incourse_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=314182;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_materials`
--
ALTER TABLE `course_materials`
  ADD CONSTRAINT `course_materials_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `enrollment_requests`
--
ALTER TABLE `enrollment_requests`
  ADD CONSTRAINT `enrollment_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_requests_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `incourse_marks`
--
ALTER TABLE `incourse_marks`
  ADD CONSTRAINT `incourse_marks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `incourse_marks_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`Course_ID`) REFERENCES `courses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
