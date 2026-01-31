// Backend Example - Node.js + Express + MySQL
// This is a complete example to get you started

// ============================================
// 1. INSTALLATION
// ============================================
/*
npm init -y
npm install express mysql2 cors dotenv jsonwebtoken bcrypt
npm install --save-dev nodemon

Add to package.json:
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
*/

// ============================================
// 2. .env FILE
// ============================================
/*
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=edu_core_os
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d
*/

// ============================================
// 3. DATABASE CONNECTION (db.js)
// ============================================
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ============================================
// 4. MIDDLEWARE (auth.middleware.js)
// ============================================
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No token provided'
                }
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired token'
            }
        });
    }
};

// ============================================
// 5. MAIN SERVER FILE (server.js)
// ============================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 6. AUTHENTICATION ROUTES
// ============================================
const bcrypt = require('bcrypt');

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and password are required'
                }
            });
        }

        // Get user from database
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND is_active = true',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        const user = users[0];

        // Verify password (in production, use bcrypt)
        // const isValidPassword = await bcrypt.compare(password, user.password);
        const isValidPassword = password === user.password; // For demo only!

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
        );

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
                user: user
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred during login'
            }
        });
    }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, institute_id, name, email, phone, role, is_active FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred'
            }
        });
    }
});

// Logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
    // In a real app, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// ============================================
// 7. STUDENTS ROUTES
// ============================================

// Get all students with pagination and filters
app.get('/api/students', authMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            per_page = 20,
            branch_id,
            academic_year_id,
            standard_id,
            medium_id,
            status,
            search
        } = req.query;

        const offset = (page - 1) * per_page;

        // Build WHERE clause
        let whereConditions = [];
        let params = [];

        if (branch_id) {
            whereConditions.push('branch_id = ?');
            params.push(branch_id);
        }
        if (academic_year_id) {
            whereConditions.push('academic_year_id = ?');
            params.push(academic_year_id);
        }
        if (standard_id) {
            whereConditions.push('standard_id = ?');
            params.push(standard_id);
        }
        if (medium_id) {
            whereConditions.push('medium_id = ?');
            params.push(medium_id);
        }
        if (status) {
            whereConditions.push('status = ?');
            params.push(status);
        }
        if (search) {
            whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR admission_number LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count
        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM students ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get students
        const [students] = await pool.execute(
            `SELECT * FROM students ${whereClause} LIMIT ? OFFSET ?`,
            [...params, parseInt(per_page), parseInt(offset)]
        );

        res.json({
            success: true,
            data: students,
            meta: {
                page: parseInt(page),
                per_page: parseInt(per_page),
                total: total,
                total_pages: Math.ceil(total / per_page)
            }
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching students'
            }
        });
    }
});

// Get single student
app.get('/api/students/:id', authMiddleware, async (req, res) => {
    try {
        const [students] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [req.params.id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Student not found'
                }
            });
        }

        res.json({
            success: true,
            data: students[0]
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching student'
            }
        });
    }
});

// Create student
app.post('/api/students', authMiddleware, async (req, res) => {
    try {
        const {
            institute_id,
            branch_id,
            academic_year_id,
            standard_id,
            medium_id,
            admission_number,
            roll_number,
            first_name,
            last_name,
            email,
            phone,
            gender,
            date_of_birth,
            address,
            city,
            state,
            pincode,
            admission_date,
            status = 'active'
        } = req.body;

        // Validation
        if (!first_name || !last_name || !phone) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Required fields are missing',
                    details: {
                        first_name: !first_name ? ['First name is required'] : undefined,
                        last_name: !last_name ? ['Last name is required'] : undefined,
                        phone: !phone ? ['Phone is required'] : undefined
                    }
                }
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO students (
                institute_id, branch_id, academic_year_id, standard_id, medium_id,
                admission_number, roll_number, first_name, last_name, email, phone,
                gender, date_of_birth, address, city, state, pincode, admission_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                institute_id, branch_id, academic_year_id, standard_id, medium_id,
                admission_number, roll_number, first_name, last_name, email, phone,
                gender, date_of_birth, address, city, state, pincode, admission_date, status
            ]
        );

        // Get created student
        const [students] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: students[0],
            message: 'Student created successfully'
        });
    } catch (error) {
        console.error('Create student error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DUPLICATE_ENTRY',
                    message: 'Admission number already exists'
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while creating student'
            }
        });
    }
});

// Update student
app.put('/api/students/:id', authMiddleware, async (req, res) => {
    try {
        const studentId = req.params.id;
        const updates = req.body;

        // Check if student exists
        const [existing] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [studentId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Student not found'
                }
            });
        }

        // Build UPDATE query
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'No fields to update'
                }
            });
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');

        await pool.execute(
            `UPDATE students SET ${setClause} WHERE id = ?`,
            [...values, studentId]
        );

        // Get updated student
        const [students] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [studentId]
        );

        res.json({
            success: true,
            data: students[0],
            message: 'Student updated successfully'
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while updating student'
            }
        });
    }
});

// Delete student
app.delete('/api/students/:id', authMiddleware, async (req, res) => {
    try {
        const studentId = req.params.id;

        // Check if student exists
        const [existing] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [studentId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Student not found'
                }
            });
        }

        // Soft delete (update status to inactive)
        await pool.execute(
            'UPDATE students SET status = ? WHERE id = ?',
            ['inactive', studentId]
        );

        // Or hard delete (uncomment to use)
        // await pool.execute('DELETE FROM students WHERE id = ?', [studentId]);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while deleting student'
            }
        });
    }
});

// ============================================
// 8. ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong!'
        }
    });
});

// ============================================
// 9. START SERVER
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
});

// ============================================
// 10. DATABASE SCHEMA (SQL)
// ============================================
/*
CREATE DATABASE edu_core_os;
USE edu_core_os;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institute_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('Owner', 'Admin', 'Teacher', 'Parent', 'Student') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institute_id INT NOT NULL,
    branch_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    standard_id INT NOT NULL,
    medium_id INT NOT NULL,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    roll_number VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    gender ENUM('Male', 'Female', 'Other'),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    admission_date DATE,
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch (branch_id),
    INDEX idx_admission_no (admission_number),
    INDEX idx_status (status)
);

-- Add more tables as needed (teachers, batches, attendance, etc.)
*/

// ============================================
// 11. HOW TO RUN
// ============================================
/*
1. Install MySQL and create database
2. Run the SQL schema above
3. Create .env file with your database credentials
4. Run: npm install
5. Run: npm run dev
6. Test with Postman or your frontend

Test Login:
POST http://localhost:3000/api/auth/login
Body: { "email": "rajesh@exceltuition.com", "password": "owner123" }

Test Get Students:
GET http://localhost:3000/api/students
Header: Authorization: Bearer YOUR_TOKEN_HERE
*/
