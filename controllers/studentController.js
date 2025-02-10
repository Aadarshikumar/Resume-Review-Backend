const fs = require('fs');
const path = require('path');
const StudentService = require('../services/studentService');

// create a class and inside it create a function with name studentRequest
class StudentController {
    static studentRequest = async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ error: 'No request body.' });
        }

        if (!req.body.name) {
            return res.status(400).json({ error: 'name is required.' });
        }

        if (!req.body.email) {
            return res.status(400).json({ error: 'email is required.' });
        }

        if (!['Android', 'Backend', 'Frontend', 'Fullstack'].includes(req.body.technology)) {
            return res.status(400).json({ error: 'Invalid technology. Only Android, Backend, Frontend, Fullstack are allowed.' });
        }

        if (!req.body.interviewDateTime) {
            return res.status(400).json({ error: 'Interview date and time is required.' });
        }

        const { name, email, technology, interviewDateTime } = req.body;
        const response = {
            name, email, technology, interviewDateTime
        };

        const studentResponse = await StudentService.createStudentRequest(response);
        res.json(studentResponse);
    };

    static getStudentById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Student ID is required." });
            }

            // Fetch student details using the StudentService
            const student = await StudentService.getStudentDetailsById(id);

            if (!student) {
                return res.status(404).json({ error: "Student not found." });
            }

            res.json(student);
        } catch (error) {
            console.error("Error fetching student:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }

    static async getAllStudents(req, res) {
        try {
            const students = await StudentService.getAllStudentsDetail();

            if (!students || students.length === 0) {
                return res.status(404).json({ error: "No students found." });
            }

            res.json(students);
        } catch (error) {
            console.error("Error fetching students:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }

    static async getAllTeachers(req, res) {
        try {
            const teachers = await StudentService.fetchTeachersData();
            res.status(200).json(teachers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    static async assignTeacherToStudent(req, res) {
        try {
            const { id } = req.params;
            const { assigned_to } = req.body;

            if (!assigned_to) {
                return res.status(400).json({ error: "assigned_to is required" });
            }

            const result = await StudentService.assignTeacherToStudents(id, assigned_to);

            if (!result) {
                return res.status(404).json({ error: "Request not found" });
            }

            res.json({ message: "Request updated successfully" });
        } catch (error) {
            console.error("Error updating request:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // can you create the function with name adminLogin(email, password) and return the response
    static async adminLogin(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            // Fetch admin details using the StudentService
            const admin = await StudentService.adminLoginStatus(email, password);

            if (!admin) {
                return res.status(404).json({ error: "Email or password may be incorrect, Please try again later!" });
            }

            res.status(200).json(admin);

        } catch (error) {
            console.error("Error fetching admin:", error);
            res.status(500).json({ error: "Internal server error" });

        }
    }

}

module.exports = StudentController;