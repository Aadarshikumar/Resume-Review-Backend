const express = require('express');
const upload = require('../config/multerConfig'); // Multer configuration for file uploads
const evaluationController = require('../controllers/evaluationController');
const StudentController = require('../controllers/studentController');

const router = express.Router();

// POST endpoint for uploading a resume and calculating the ATS score
router.post('/upload-resume', upload.single('resume'), evaluationController.uploadResume); // Not in use currently
// payload: resume, jobDescription

// Route for uploading resumes and calculating ATS score
router.post('/upload-resume-with-diff', upload.single('resume'), evaluationController.uploadResumeWithDiff);// payload resume only

//# STUDENTS
// create a student request POST endpoint. which will basically take some payloads.
router.post('/students-request', StudentController.studentRequest); // Not in use currently.
// http://localhost:3000/api/students-request
// {
//     "name": "Ujala",
//     "email": "abc11@example.com",
//     "technology": "Backend",
//     "status": "pending",
//     "interviewDateTime": "2025-02-10T12:30:00"
//   }
  
router.get('/student/:id', StudentController.getStudentById);
// http://localhost:3000/api/student/2

    
router.get('/students', StudentController.getAllStudents);
// http://localhost:3000/api/students

router.get('/teachers', StudentController.getAllTeachers);
// http://localhost:3000/api/teachers/


router.put("/student-assigned/:id", StudentController.assignTeacherToStudent);
// http://localhost:3000/api/student-assigned/12
// {
//     "assigned_to": "Aadarsh Kumar",
//     "interview_scheduled_at": "2025-02-20T18:30:00"

// }

router.post('/admin-login', StudentController.adminLogin);
// http://localhost:3000/api/admin-login
// {
//     "email": "aadarsh@navgurukul.org",
//     "password": "admin"
// }



module.exports = router;