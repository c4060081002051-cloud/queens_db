-- Run in phpMyAdmin or: mysql -u root queensdb < db/schema.sql
-- Create database first if needed: CREATE DATABASE queensdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--
-- Tables match Sequelize models in src/models/index.ts

USE queensdb;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS classrooms (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  grade_level VARCHAR(50) NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  admission_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NULL,
  parent_email VARCHAR(255) NULL,
  class_room_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_admission (admission_number),
  KEY students_class_room_id_idx (class_room_id),
  CONSTRAINT fk_students_classroom FOREIGN KEY (class_room_id) REFERENCES classrooms (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin: admin@gmail.com / admin@123
INSERT INTO users (email, password_hash, role) VALUES
(
  'admin@gmail.com',
  '$2b$12$biuCsX53imtYBlEhRDkMlO6DjQziAn0TifVA1pTQmox8WQ.N/rkEy',
  'admin'
)
ON DUPLICATE KEY UPDATE email = email;
