CREATE SCHEMA employeerecordsystem; 

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
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id)
);

CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    login_time DATETIME,
    ip_address VARCHAR(50),
    success BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    contact_number VARCHAR(50),
    address VARCHAR(255),
    profile_picture VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category ENUM('CONTRACT','TOR','LICENSE','OTHER') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

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
    user_id INT,         -- person being evaluated
    evaluator_id INT,    -- head / HR
    score DECIMAL(5,2),
    comments TEXT,
    evaluation_date DATE,
    FOREIGN KEY (form_id) REFERENCES evaluation_forms(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id)
);

CREATE TABLE student_feedback_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    period VARCHAR(50),
    average_score DECIMAL(5,2),
    remarks TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255)
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
