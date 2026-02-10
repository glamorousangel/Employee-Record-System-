CREATE SCHEMA IF NOT EXISTS employeerecordsystem;
USE employeerecordsystem;

-- 1. REFERENCE TABLES
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name ENUM('ADMIN','HR','HEAD','EMPLOYEE') NOT NULL UNIQUE
);

-- 2. USER MANAGEMENT (WITH HIERARCHY)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    must_change_password BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    department_id INT,
    position_id INT,
    manager_id INT NULL,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. USER PROFILES
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    contact_number VARCHAR(50),
    address VARCHAR(255),
    profile_picture VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. DOCUMENT MANAGEMENT
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category ENUM('CONTRACT','TOR','LICENSE','OTHER') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    expiry_date DATE NULL,
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 5. ATTENDANCE TRACKING
CREATE TABLE attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    log_date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    status ENUM('PRESENT','ABSENT','LATE','UNDERTIME') NOT NULL,
    remarks VARCHAR(255),
    edited_by INT,
    edited_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (edited_by) REFERENCES users(id)
);

CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    day_of_week ENUM('MON','TUE','WED','THU','FRI','SAT'),
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. LEAVE MANAGEMENT
CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE leave_balances (
    user_id INT,
    leave_type_id INT,
    balance DECIMAL(5,2) DEFAULT 0,
    PRIMARY KEY (user_id, leave_type_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    leave_type_id INT,
    start_date DATE,
    end_date DATE,
    reason VARCHAR(255),
    status ENUM('PENDING_HEAD','REJECTED_HEAD','PENDING_HR','APPROVED','REJECTED_HR') DEFAULT 'PENDING_HEAD',
    head_action_by INT,
    head_action_at DATETIME,
    hr_action_by INT,
    hr_action_at DATETIME,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (head_action_by) REFERENCES users(id),
    FOREIGN KEY (hr_action_by) REFERENCES users(id)
);

-- 7. PERFORMANCE EVALUATION
CREATE TABLE evaluation_forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT,
    user_id INT,
    evaluator_id INT,
    score DECIMAL(5,2),
    comments TEXT,
    evaluation_date DATE,
    FOREIGN KEY (form_id) REFERENCES evaluation_forms(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id)
);

-- 8. STUDENT FEEDBACK
CREATE TABLE student_feedback_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    period VARCHAR(50),
    average_score DECIMAL(5,2),
    remarks TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. CLEARANCES
CREATE TABLE clearances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_name VARCHAR(255),
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. NOTIFICATIONS & LOGS
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message VARCHAR(255),
    type ENUM('EXPIRY','LEAVE','SYSTEM') DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    login_time DATETIME,
    ip_address VARCHAR(50),
    success BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id INT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
