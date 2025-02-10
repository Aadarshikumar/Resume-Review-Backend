const pool = require('../config/pool');
const axios = require("axios");
const Papa = require("papaparse");
const dotenv = require('dotenv');
dotenv.config();

class StudentService {
    static async createStudentRequest(studentData) {
        try {
            const { name, email, technology, interviewDateTime } = studentData;

            const query = `
                INSERT INTO request (name, email, technology, interviewDateTime)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;

            const values = [name, email, technology, interviewDateTime];

            const result = await pool.query(query, values);
            return result.rows[0]; // Return inserted row
        } catch (error) {
            console.error('Error inserting student request:', error);
            throw error;
        }
    }

    static async getStudentDetailsById(id) {
        try {
            const query = "SELECT * FROM request WHERE id = $1";
            const result = await pool.query(query, [id]);

            return result.rows[0] || null;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    }

    static async getAllStudentsDetail() {
        try {
            const query = "SELECT * FROM request ORDER BY created_at DESC";
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    }

    static async fetchTeachersData() {
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${process.env.SHEET_NAME}`;
        try {
            const response = await axios.get(SHEET_URL);
            const csvData = response.data;

            return new Promise((resolve) => {
                Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        resolve(results.data);
                    },
                });
            });
        } catch (error) {
            console.error("Error fetching Google Sheets data:", error);
            throw new Error("Failed to retrieve data");
        }
    };

    static async assignTeacherToStudents(id, assigned_to) {
        try {
            const query = `
                UPDATE request 
                SET status = $1, assigned_to = $2 
                WHERE id = $3 
                RETURNING *;
            `;

            const values = ["assigned", assigned_to, id];
            const result = await pool.query(query, values);

            return result.rowCount ? result.rows[0] : null;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    }

    // create this function adminLoginStatus(email, password) and return the response
    static async adminLoginStatus(email, password) {
        try {
            const query = "SELECT * FROM admin WHERE email = $1 AND password = $2";
            const result = await pool.query(query, [email, password]);

            return result.rows[0] || null;
        } catch (error) {
            console.error("Database error:", error);
            throw error;
        }
    }


}

module.exports = StudentService;
