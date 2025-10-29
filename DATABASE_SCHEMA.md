# SmartMed Database Schema Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Database Tables](#database-tables)
4. [Table Relationships](#table-relationships)
5. [Connection Types](#connection-types)
6. [SQL Scripts](#sql-scripts)
7. [Sample Queries](#sample-queries)

---

## Overview

**Database Name:** `smartmed_db`  
**Database Type:** MySQL 8.0  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci  
**Total Tables:** 13

### Database Connection Configuration
```properties
# Spring Boot Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/smartmed_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

## Entity Relationship Diagram

### Main Entity Relationships Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SMARTMED DATABASE SCHEMA                         │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │    USERS     │ (Core Authentication)
                            │──────────────│
                            │ PK: id       │
                            │ username     │
                            │ email        │
                            │ password     │
                            │ role         │
                            └──────┬───────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
        ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
        │ STUDENT_DETAILS │ │ APPOINTMENTS │ │VIDEO_ROOMS   │
        │─────────────────│ │──────────────│ │──────────────│
        │ PK: id          │ │ PK: id       │ │ PK: id       │
        │ FK: user_id     │ │ FK: user_id  │ │ FK: user_id  │
        │ name            │ │ doctor_id    │ │ room_sid     │
        │ dob             │ │ datetime     │ │ status       │
        │ blood_group     │ │ status       │ └──────────────┘
        └────────┬────────┘ └──────────────┘
                 │
    ┌────────────┼────────────┬─────────────┐
    │            │            │             │
    ▼            ▼            ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐
│FAMILY   │ │MEDICAL  │ │EMERGENCY │ │VACCINATIONS │
│HISTORY  │ │HISTORY  │ │CONTACTS  │ │─────────────│
│─────────│ │─────────│ │──────────│ │ PK: id      │
│ PK: id  │ │ PK: id  │ │ PK: id   │ │ FK: student │
│FK:studen│ │FK:studen│ │FK:student│ │ vaccine_name│
│ relation│ │ illness │ │ name     │ │ date_given  │
│ illness │ │ duration│ │ phone    │ └─────────────┘
└─────────┘ └─────────┘ └──────────┘
                 │
                 │
                 ▼
        ┌──────────────────┐
        │ MEDICAL_RECORDS  │ (Central Medical Data)
        │──────────────────│
        │ PK: id           │
        │ FK: student_id   │
        │ FK: doctor_id    │
        │ visit_date       │
        │ diagnosis        │
        │ treatment        │
        │ notes            │
        └────────┬─────────┘
                 │
                 │ One-to-Many
                 ▼
        ┌──────────────────┐
        │  PRESCRIPTIONS   │
        │──────────────────│
        │ PK: id           │
        │ FK: record_id    │
        │ FK: medicine_id  │
        │ dosage           │
        │ frequency        │
        │ duration         │
        │ status           │
        └────────┬─────────┘
                 │
                 │ Many-to-One
                 ▼
        ┌──────────────────┐
        │    MEDICINES     │ (Medicine Master)
        │──────────────────│
        │ PK: id           │
        │ name             │
        │ category         │
        │ manufacturer     │
        │ description      │
        └────────┬─────────┘
                 │
                 │ One-to-One
                 ▼
        ┌──────────────────┐
        │  MEDICINE_STOCK  │ (Inventory)
        │──────────────────│
        │ PK: id           │
        │ FK: medicine_id  │
        │ quantity         │
        │ threshold_level  │
        │ expiry_date      │
        │ location         │
        └──────────────────┘

        ┌──────────────────┐
        │      QUEUE       │ (Waiting Queue)
        │──────────────────│
        │ PK: id           │
        │ FK: student_id   │
        │ queue_number     │
        │ status           │
        │ created_at       │
        └──────────────────┘
```

### Detailed Relationship Types

```
┌─────────────────────────────────────────────────────────────────┐
│                     RELATIONSHIP LEGEND                          │
├─────────────────────────────────────────────────────────────────┤
│ [1:1]   = One-to-One Relationship                               │
│ [1:N]   = One-to-Many Relationship                              │
│ [N:1]   = Many-to-One Relationship                              │
│ [N:M]   = Many-to-Many Relationship                             │
│ FK      = Foreign Key                                           │
│ PK      = Primary Key                                           │
│ UNIQUE  = Unique Constraint                                     │
│ INDEX   = Indexed Column                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Tables

### 1. USERS Table (Core Authentication)
**Purpose:** Stores user authentication and role information

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);
```

**Columns:**
- `id` - Primary key (Auto-increment)
- `username` - Unique username (50 chars)
- `email` - Unique email address (100 chars)
- `password` - Encrypted password (255 chars)
- `role` - User role: STUDENT, DOCTOR, RECEPTIONIST, PHARMACIST, HOSPITAL_STAFF, ADMIN
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**
- [1:1] → `student_details` (One user can have one student profile)
- [1:N] → `appointments` (One user can have many appointments)
- [1:N] → `medical_records` (One doctor can create many records)
- [1:N] → `video_rooms` (One user can have many video calls)

---

### 2. STUDENT_DETAILS Table
**Purpose:** Stores detailed student personal information

```sql
CREATE TABLE student_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    address TEXT,
    phone_number VARCHAR(20),
    student_id_number VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    year_of_study INT,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id_number),
    INDEX idx_user_id (user_id)
);
```

**Columns:**
- `id` - Primary key
- `user_id` - Foreign key to users table (UNIQUE)
- `name` - Full name of student
- `date_of_birth` - Date of birth
- `gender` - Male/Female/Other
- `blood_group` - A+, B+, O+, AB+, etc.
- `address` - Residential address
- `phone_number` - Contact number
- `student_id_number` - Unique college ID
- `department` - Academic department
- `year_of_study` - Current year (1-4)
- `guardian_name` - Parent/Guardian name
- `guardian_phone` - Emergency contact

**Relationships:**
- [N:1] → `users` (Many students to one user account)
- [1:N] → `family_history` (One student can have multiple family history records)
- [1:N] → `medical_history` (One student can have multiple medical history records)
- [1:N] → `vaccinations` (One student can have multiple vaccination records)
- [1:N] → `emergency_contacts` (One student can have multiple emergency contacts)
- [1:N] → `medical_records` (One student can have multiple medical records)
- [1:N] → `queue` (One student can be in queue multiple times)

---

### 3. FAMILY_HISTORY Table
**Purpose:** Stores family medical history

```sql
CREATE TABLE family_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    relation VARCHAR(50) NOT NULL,
    illness VARCHAR(100) NOT NULL,
    age_of_onset INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
);
```

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key to student_details
- `relation` - Father, Mother, Sibling, Grandparent, etc.
- `illness` - Name of disease/condition
- `age_of_onset` - Age when illness started
- `notes` - Additional information

**Relationships:**
- [N:1] → `student_details` (Many family history records to one student)

---

### 4. MEDICAL_HISTORY Table
**Purpose:** Stores student's personal medical history

```sql
CREATE TABLE medical_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    illness VARCHAR(100) NOT NULL,
    diagnosed_date DATE,
    duration VARCHAR(50),
    treatment_received TEXT,
    current_status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
);
```

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key to student_details
- `illness` - Disease/condition name
- `diagnosed_date` - When diagnosed
- `duration` - How long the condition lasted
- `treatment_received` - Treatment details
- `current_status` - Active/Resolved/Chronic
- `notes` - Additional information

**Relationships:**
- [N:1] → `student_details` (Many medical history records to one student)

---

### 5. VACCINATIONS Table
**Purpose:** Stores vaccination records

```sql
CREATE TABLE vaccinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    date_given DATE NOT NULL,
    dose_number INT,
    next_dose_date DATE,
    administered_by VARCHAR(100),
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_vaccine (vaccine_name)
);
```

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key to student_details
- `vaccine_name` - Name of vaccine
- `date_given` - Date of vaccination
- `dose_number` - 1st, 2nd, booster, etc.
- `next_dose_date` - When next dose is due
- `administered_by` - Doctor/Nurse name
- `batch_number` - Vaccine batch number
- `notes` - Side effects or other notes

**Relationships:**
- [N:1] → `student_details` (Many vaccination records to one student)

---

### 6. EMERGENCY_CONTACTS Table
**Purpose:** Stores emergency contact information

```sql
CREATE TABLE emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address TEXT,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
);
```

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key to student_details
- `name` - Contact person name
- `relationship` - Parent, Sibling, Friend, etc.
- `phone_number` - Primary phone
- `alternate_phone` - Secondary phone
- `address` - Contact address
- `priority` - 1 (Primary), 2 (Secondary), etc.

**Relationships:**
- [N:1] → `student_details` (Many emergency contacts to one student)

---

### 7. MEDICAL_RECORDS Table (Central Medical Data)
**Purpose:** Stores medical consultation records

```sql
CREATE TABLE medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    visit_date TIMESTAMP NOT NULL,
    chief_complaint TEXT,
    symptoms TEXT,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    notes TEXT,
    follow_up_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_visit_date (visit_date)
);
```

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key to student_details
- `doctor_id` - Foreign key to users (doctor)
- `visit_date` - Date and time of visit
- `chief_complaint` - Main reason for visit
- `symptoms` - Symptoms described
- `diagnosis` - Doctor's diagnosis
- `treatment_plan` - Treatment recommended
- `notes` - Additional notes
- `follow_up_date` - Next appointment date
- `status` - ACTIVE, COMPLETED, CANCELLED

**Relationships:**
- [N:1] → `student_details` (Many records for one student)
- [N:1] → `users` (Many records created by one doctor)
- [1:N] → `prescriptions` (One record can have many prescriptions)

---

### 8. MEDICINES Table (Medicine Master Data)
**Purpose:** Master list of available medicines

```sql
CREATE TABLE medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    generic_name VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    description TEXT,
    side_effects TEXT,
    contraindications TEXT,
    dosage_forms VARCHAR(100),
    strength VARCHAR(50),
    price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);
```

**Columns:**
- `id` - Primary key
- `name` - Medicine brand name (UNIQUE)
- `generic_name` - Generic/chemical name
- `category` - Antibiotic, Painkiller, Vitamin, etc.
- `manufacturer` - Manufacturing company
- `description` - Medicine description
- `side_effects` - Known side effects
- `contraindications` - When not to use
- `dosage_forms` - Tablet, Syrup, Injection, etc.
- `strength` - 500mg, 10ml, etc.
- `price` - Unit price
- `is_active` - Active/Discontinued

**Relationships:**
- [1:1] → `medicine_stock` (One medicine has one stock record)
- [1:N] → `prescriptions` (One medicine can be in many prescriptions)

---

### 9. MEDICINE_STOCK Table (Inventory Management)
**Purpose:** Tracks medicine inventory levels

```sql
CREATE TABLE medicine_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    threshold_level INT NOT NULL DEFAULT 10,
    expiry_date DATE,
    batch_number VARCHAR(50),
    location VARCHAR(100),
    last_restocked TIMESTAMP,
    last_dispensed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_quantity (quantity),
    INDEX idx_expiry (expiry_date)
);
```

**Columns:**
- `id` - Primary key
- `medicine_id` - Foreign key to medicines (UNIQUE)
- `quantity` - Current stock quantity
- `threshold_level` - Minimum stock alert level
- `expiry_date` - Expiration date
- `batch_number` - Batch identifier
- `location` - Storage location (Shelf A1, etc.)
- `last_restocked` - Last restock timestamp
- `last_dispensed` - Last dispensing timestamp

**Relationships:**
- [1:1] → `medicines` (One stock record for one medicine)

---

### 10. PRESCRIPTIONS Table
**Purpose:** Stores medicine prescriptions

```sql
CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    dispensed_by BIGINT,
    dispensed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
    FOREIGN KEY (dispensed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_record_id (medical_record_id),
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_status (status)
);
```

**Columns:**
- `id` - Primary key
- `medical_record_id` - Foreign key to medical_records
- `medicine_id` - Foreign key to medicines
- `dosage` - "1 tablet", "5ml", etc.
- `frequency` - "Twice daily", "Before meals", etc.
- `duration` - "7 days", "2 weeks", etc.
- `quantity` - Total quantity to dispense
- `instructions` - Special instructions
- `status` - PENDING, DISPENSED, CANCELLED
- `dispensed_by` - Pharmacist who dispensed
- `dispensed_at` - Dispensing timestamp

**Relationships:**
- [N:1] → `medical_records` (Many prescriptions for one medical record)
- [N:1] → `medicines` (Many prescriptions for one medicine)
- [N:1] → `users` (Many prescriptions dispensed by one pharmacist)

---

### 11. APPOINTMENTS Table
**Purpose:** Manages appointment scheduling

```sql
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
);
```

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key to users (student)
- `doctor_id` - Foreign key to users (doctor)
- `appointment_date` - Scheduled date and time
- `reason` - Reason for appointment
- `status` - SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
- `notes` - Additional notes

**Relationships:**
- [N:1] → `users` (Many appointments for one student)
- [N:1] → `users` (Many appointments for one doctor)

---

### 12. QUEUE Table
**Purpose:** Manages patient waiting queue

```sql
CREATE TABLE queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    queue_number INT NOT NULL,
    queue_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'WAITING',
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_time TIMESTAMP,
    completed_time TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    UNIQUE KEY unique_queue (queue_date, queue_number),
    INDEX idx_student_id (student_id),
    INDEX idx_date (queue_date),
    INDEX idx_status (status)
);
```

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key to student_details
- `queue_number` - Token number for the day
- `queue_date` - Date of queue
- `status` - WAITING, CALLED, IN_PROGRESS, COMPLETED, CANCELLED
- `check_in_time` - When student checked in
- `called_time` - When student was called
- `completed_time` - When consultation completed
- `notes` - Additional notes

**Relationships:**
- [N:1] → `student_details` (Many queue entries for one student)

---

### 13. VIDEO_ROOMS Table
**Purpose:** Manages video call sessions

```sql
CREATE TABLE video_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_sid VARCHAR(100) NOT NULL UNIQUE,
    room_name VARCHAR(100) NOT NULL,
    doctor_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration INT,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room_sid (room_sid),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
);
```

**Columns:**
- `id` - Primary key
- `room_sid` - Twilio Room SID (UNIQUE)
- `room_name` - Room identifier
- `doctor_id` - Foreign key to users (doctor)
- `student_id` - Foreign key to users (student)
- `status` - ACTIVE, COMPLETED, CANCELLED
- `created_at` - Room creation time
- `ended_at` - Room end time
- `duration` - Call duration in seconds

**Relationships:**
- [N:1] → `users` (Many video rooms for one doctor)
- [N:1] → `users` (Many video rooms for one student)

---

## Table Relationships

### Comprehensive Relationship Matrix

| Parent Table | Relationship | Child Table | Type | Foreign Key | On Delete |
|-------------|-------------|-------------|------|-------------|-----------|
| **users** | 1:1 | student_details | One-to-One | user_id | CASCADE |
| **users** | 1:N | appointments (student) | One-to-Many | student_id | CASCADE |
| **users** | 1:N | appointments (doctor) | One-to-Many | doctor_id | CASCADE |
| **users** | 1:N | medical_records | One-to-Many | doctor_id | RESTRICT |
| **users** | 1:N | video_rooms (doctor) | One-to-Many | doctor_id | CASCADE |
| **users** | 1:N | video_rooms (student) | One-to-Many | student_id | CASCADE |
| **student_details** | 1:N | family_history | One-to-Many | student_id | CASCADE |
| **student_details** | 1:N | medical_history | One-to-Many | student_id | CASCADE |
| **student_details** | 1:N | vaccinations | One-to-Many | student_id | CASCADE |
| **student_details** | 1:N | emergency_contacts | One-to-Many | student_id | CASCADE |
| **student_details** | 1:N | medical_records | One-to-Many | student_id | CASCADE |
| **student_details** | 1:N | queue | One-to-Many | student_id | CASCADE |
| **medical_records** | 1:N | prescriptions | One-to-Many | medical_record_id | CASCADE |
| **medicines** | 1:1 | medicine_stock | One-to-One | medicine_id | CASCADE |
| **medicines** | 1:N | prescriptions | One-to-Many | medicine_id | RESTRICT |

### Cascade Effects Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DELETE CASCADE EFFECTS                        │
└─────────────────────────────────────────────────────────────────┘

Delete USER (role: STUDENT)
    ↓ CASCADE
    └→ student_details
        ↓ CASCADE
        ├→ family_history (all records deleted)
        ├→ medical_history (all records deleted)
        ├→ vaccinations (all records deleted)
        ├→ emergency_contacts (all records deleted)
        ├→ medical_records (all records deleted)
        │   ↓ CASCADE
        │   └→ prescriptions (all prescriptions deleted)
        └→ queue (all queue entries deleted)

Delete USER (role: DOCTOR)
    ↓ RESTRICT
    └→ medical_records (CANNOT delete if records exist)

Delete MEDICINE
    ↓ CASCADE
    ├→ medicine_stock (stock record deleted)
    │
    ↓ RESTRICT
    └→ prescriptions (CANNOT delete if prescriptions exist)

Delete MEDICAL_RECORD
    ↓ CASCADE
    └→ prescriptions (all prescriptions deleted)
```

---

## Connection Types

### 1. One-to-One (1:1) Relationships

```
users (1) ←→ (1) student_details
├─ One user account = One student profile
├─ Constraint: UNIQUE on student_details.user_id
└─ Delete: CASCADE

medicines (1) ←→ (1) medicine_stock
├─ One medicine = One stock record
├─ Constraint: UNIQUE on medicine_stock.medicine_id
└─ Delete: CASCADE
```

### 2. One-to-Many (1:N) Relationships

```
student_details (1) ←→ (N) family_history
├─ One student can have multiple family history records
└─ Delete: CASCADE

student_details (1) ←→ (N) medical_history
├─ One student can have multiple medical conditions
└─ Delete: CASCADE

student_details (1) ←→ (N) vaccinations
├─ One student can have multiple vaccination records
└─ Delete: CASCADE

student_details (1) ←→ (N) emergency_contacts
├─ One student can have multiple emergency contacts
└─ Delete: CASCADE

student_details (1) ←→ (N) medical_records
├─ One student can have multiple consultation records
└─ Delete: CASCADE

users [doctor] (1) ←→ (N) medical_records
├─ One doctor can create multiple medical records
└─ Delete: RESTRICT (prevents deletion if records exist)

medical_records (1) ←→ (N) prescriptions
├─ One medical record can have multiple prescriptions
└─ Delete: CASCADE

medicines (1) ←→ (N) prescriptions
├─ One medicine can be prescribed multiple times
└─ Delete: RESTRICT (prevents deletion if prescribed)

users [student] (1) ←→ (N) appointments
├─ One student can have multiple appointments
└─ Delete: CASCADE

users [doctor] (1) ←→ (N) appointments
├─ One doctor can have multiple appointments
└─ Delete: CASCADE

student_details (1) ←→ (N) queue
├─ One student can be in queue multiple times
└─ Delete: CASCADE

users [doctor] (1) ←→ (N) video_rooms
├─ One doctor can have multiple video sessions
└─ Delete: CASCADE

users [student] (1) ←→ (N) video_rooms
├─ One student can have multiple video sessions
└─ Delete: CASCADE
```

### 3. Many-to-One (N:1) Relationships

These are the inverse of One-to-Many relationships:
- Multiple prescriptions → One medical record
- Multiple prescriptions → One medicine
- Multiple medical records → One student
- Multiple medical records → One doctor

### 4. Many-to-Many (N:M) Implementation

The system uses bridge tables to implement many-to-many relationships:

```
students (N) ←→ medicines (M)
    ↓
prescriptions (bridge table)
    ├─ student_id (via medical_record_id → student_id)
    └─ medicine_id

doctors (N) ←→ students (M)
    ↓
medical_records (bridge table)
    ├─ doctor_id
    └─ student_id
```

---

## SQL Scripts

### Complete Database Setup Script

```sql
-- ============================================
-- SMARTMED DATABASE SETUP SCRIPT
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS smartmed_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smartmed_db;

-- ============================================
-- TABLE 1: USERS (Core Authentication)
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 2: STUDENT_DETAILS
-- ============================================
CREATE TABLE student_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    address TEXT,
    phone_number VARCHAR(20),
    student_id_number VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    year_of_study INT,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id_number),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 3: FAMILY_HISTORY
-- ============================================
CREATE TABLE family_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    relation VARCHAR(50) NOT NULL,
    illness VARCHAR(100) NOT NULL,
    age_of_onset INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 4: MEDICAL_HISTORY
-- ============================================
CREATE TABLE medical_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    illness VARCHAR(100) NOT NULL,
    diagnosed_date DATE,
    duration VARCHAR(50),
    treatment_received TEXT,
    current_status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 5: VACCINATIONS
-- ============================================
CREATE TABLE vaccinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    date_given DATE NOT NULL,
    dose_number INT,
    next_dose_date DATE,
    administered_by VARCHAR(100),
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_vaccine (vaccine_name)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 6: EMERGENCY_CONTACTS
-- ============================================
CREATE TABLE emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address TEXT,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 7: MEDICAL_RECORDS (Central)
-- ============================================
CREATE TABLE medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    visit_date TIMESTAMP NOT NULL,
    chief_complaint TEXT,
    symptoms TEXT,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    notes TEXT,
    follow_up_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 8: MEDICINES (Master Data)
-- ============================================
CREATE TABLE medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    generic_name VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    description TEXT,
    side_effects TEXT,
    contraindications TEXT,
    dosage_forms VARCHAR(100),
    strength VARCHAR(50),
    price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 9: MEDICINE_STOCK
-- ============================================
CREATE TABLE medicine_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    threshold_level INT NOT NULL DEFAULT 10,
    expiry_date DATE,
    batch_number VARCHAR(50),
    location VARCHAR(100),
    last_restocked TIMESTAMP,
    last_dispensed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_quantity (quantity),
    INDEX idx_expiry (expiry_date)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 10: PRESCRIPTIONS
-- ============================================
CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    dispensed_by BIGINT,
    dispensed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
    FOREIGN KEY (dispensed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_record_id (medical_record_id),
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 11: APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 12: QUEUE
-- ============================================
CREATE TABLE queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    queue_number INT NOT NULL,
    queue_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'WAITING',
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_time TIMESTAMP,
    completed_time TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES student_details(id) ON DELETE CASCADE,
    UNIQUE KEY unique_queue (queue_date, queue_number),
    INDEX idx_student_id (student_id),
    INDEX idx_date (queue_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 13: VIDEO_ROOMS
-- ============================================
CREATE TABLE video_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_sid VARCHAR(100) NOT NULL UNIQUE,
    room_name VARCHAR(100) NOT NULL,
    doctor_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration INT,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room_sid (room_sid),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- DATABASE TRIGGERS
-- ============================================

-- Trigger: Auto-generate queue number
DELIMITER $$
CREATE TRIGGER before_queue_insert
BEFORE INSERT ON queue
FOR EACH ROW
BEGIN
    DECLARE next_number INT;
    SELECT IFNULL(MAX(queue_number), 0) + 1 INTO next_number
    FROM queue
    WHERE queue_date = NEW.queue_date;
    SET NEW.queue_number = next_number;
END$$
DELIMITER ;

-- Trigger: Update medicine stock after prescription dispensed
DELIMITER $$
CREATE TRIGGER after_prescription_update
AFTER UPDATE ON prescriptions
FOR EACH ROW
BEGIN
    IF NEW.status = 'DISPENSED' AND OLD.status != 'DISPENSED' THEN
        UPDATE medicine_stock
        SET quantity = quantity - NEW.quantity,
            last_dispensed = NOW()
        WHERE medicine_id = NEW.medicine_id;
    END IF;
END$$
DELIMITER ;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert sample users
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@smartmed.com', '$2a$10$hashed_password_1', 'ADMIN'),
('dr.smith', 'drsmith@smartmed.com', '$2a$10$hashed_password_2', 'DOCTOR'),
('receptionist1', 'reception@smartmed.com', '$2a$10$hashed_password_3', 'RECEPTIONIST'),
('pharmacist1', 'pharmacy@smartmed.com', '$2a$10$hashed_password_4', 'PHARMACIST'),
('student001', 'john.doe@college.edu', '$2a$10$hashed_password_5', 'STUDENT'),
('student002', 'jane.smith@college.edu', '$2a$10$hashed_password_6', 'STUDENT');

-- Insert sample student details
INSERT INTO student_details (user_id, name, date_of_birth, gender, blood_group, address, phone_number, student_id_number, department, year_of_study, guardian_name, guardian_phone) VALUES
(5, 'John Doe', '2002-05-15', 'Male', 'O+', '123 College Street, City', '9876543210', 'CS2023001', 'Computer Science', 2, 'Robert Doe', '9876543211'),
(6, 'Jane Smith', '2003-08-22', 'Female', 'A+', '456 Campus Road, City', '9876543220', 'EE2023002', 'Electrical Engineering', 2, 'Mary Smith', '9876543221');

-- Insert sample medicines
INSERT INTO medicines (name, generic_name, category, manufacturer, description, dosage_forms, strength, price, is_active) VALUES
('Paracetamol', 'Acetaminophen', 'Painkiller', 'PharmaCorp', 'Pain and fever relief', 'Tablet', '500mg', 5.00, TRUE),
('Amoxicillin', 'Amoxicillin', 'Antibiotic', 'MediLife', 'Bacterial infection treatment', 'Capsule', '250mg', 15.00, TRUE),
('Cetirizine', 'Cetirizine', 'Antihistamine', 'HealthPlus', 'Allergy relief', 'Tablet', '10mg', 8.00, TRUE),
('Vitamin D3', 'Cholecalciferol', 'Vitamin', 'WellnessCo', 'Bone health supplement', 'Tablet', '1000IU', 12.00, TRUE);

-- Insert sample medicine stock
INSERT INTO medicine_stock (medicine_id, quantity, threshold_level, expiry_date, batch_number, location) VALUES
(1, 500, 50, '2026-12-31', 'BATCH001', 'Shelf A1'),
(2, 200, 30, '2025-06-30', 'BATCH002', 'Shelf A2'),
(3, 300, 40, '2026-03-31', 'BATCH003', 'Shelf B1'),
(4, 150, 20, '2027-01-31', 'BATCH004', 'Shelf B2');

-- Insert sample appointments
INSERT INTO appointments (student_id, doctor_id, appointment_date, reason, status) VALUES
(5, 2, '2025-11-01 10:00:00', 'General checkup', 'SCHEDULED'),
(6, 2, '2025-11-01 11:00:00', 'Fever and cold', 'SCHEDULED');

-- Insert sample queue entries
INSERT INTO queue (student_id, queue_date, status) VALUES
(1, CURDATE(), 'WAITING'),
(2, CURDATE(), 'WAITING');

SELECT 'Database setup completed successfully!' AS Status;
```

---

## Sample Queries

### Common Query Patterns

#### 1. Get Student Complete Profile
```sql
SELECT 
    u.username,
    u.email,
    u.role,
    sd.name,
    sd.date_of_birth,
    sd.blood_group,
    sd.department,
    sd.year_of_study,
    sd.phone_number,
    sd.student_id_number
FROM users u
INNER JOIN student_details sd ON u.id = sd.user_id
WHERE u.id = ?;
```

#### 2. Get Student Medical History
```sql
SELECT 
    mh.illness,
    mh.diagnosed_date,
    mh.duration,
    mh.current_status,
    mh.treatment_received
FROM medical_history mh
INNER JOIN student_details sd ON mh.student_id = sd.id
WHERE sd.user_id = ?
ORDER BY mh.diagnosed_date DESC;
```

#### 3. Get All Prescriptions for a Medical Record
```sql
SELECT 
    p.id,
    m.name AS medicine_name,
    m.generic_name,
    p.dosage,
    p.frequency,
    p.duration,
    p.quantity,
    p.instructions,
    p.status,
    CONCAT(u.username, ' (', u.role, ')') AS dispensed_by
FROM prescriptions p
INNER JOIN medicines m ON p.medicine_id = m.id
LEFT JOIN users u ON p.dispensed_by = u.id
WHERE p.medical_record_id = ?;
```

#### 4. Get Low Stock Medicines
```sql
SELECT 
    m.name,
    m.category,
    ms.quantity,
    ms.threshold_level,
    ms.expiry_date,
    ms.location,
    (ms.threshold_level - ms.quantity) AS shortage
FROM medicines m
INNER JOIN medicine_stock ms ON m.medicine_id = ms.medicine_id
WHERE ms.quantity < ms.threshold_level
ORDER BY shortage DESC;
```

#### 5. Get Today's Queue Status
```sql
SELECT 
    q.queue_number,
    sd.name AS student_name,
    sd.student_id_number,
    q.status,
    q.check_in_time,
    q.called_time,
    TIMESTAMPDIFF(MINUTE, q.check_in_time, IFNULL(q.called_time, NOW())) AS waiting_time
FROM queue q
INNER JOIN student_details sd ON q.student_id = sd.id
WHERE q.queue_date = CURDATE()
ORDER BY q.queue_number;
```

#### 6. Get Doctor's Appointments for Today
```sql
SELECT 
    a.id,
    a.appointment_date,
    sd.name AS student_name,
    sd.student_id_number,
    a.reason,
    a.status
FROM appointments a
INNER JOIN users u ON a.student_id = u.id
INNER JOIN student_details sd ON u.id = sd.user_id
WHERE a.doctor_id = ?
  AND DATE(a.appointment_date) = CURDATE()
ORDER BY a.appointment_date;
```

#### 7. Get Student's Complete Medical Records
```sql
SELECT 
    mr.visit_date,
    CONCAT(dr.username) AS doctor_name,
    mr.chief_complaint,
    mr.diagnosis,
    mr.treatment_plan,
    mr.follow_up_date,
    mr.status
FROM medical_records mr
INNER JOIN student_details sd ON mr.student_id = sd.id
INNER JOIN users dr ON mr.doctor_id = dr.id
WHERE sd.user_id = ?
ORDER BY mr.visit_date DESC;
```

#### 8. Get Pending Prescriptions
```sql
SELECT 
    p.id,
    sd.name AS student_name,
    m.name AS medicine_name,
    p.quantity,
    mr.visit_date,
    CONCAT(dr.username) AS prescribed_by
FROM prescriptions p
INNER JOIN medical_records mr ON p.medical_record_id = mr.id
INNER JOIN student_details sd ON mr.student_id = sd.id
INNER JOIN users dr ON mr.doctor_id = dr.id
INNER JOIN medicines m ON p.medicine_id = m.id
WHERE p.status = 'PENDING'
ORDER BY mr.visit_date DESC;
```

#### 9. Get Medicine Usage Statistics
```sql
SELECT 
    m.name,
    m.category,
    COUNT(p.id) AS prescription_count,
    SUM(p.quantity) AS total_quantity_dispensed,
    ms.quantity AS current_stock
FROM medicines m
LEFT JOIN prescriptions p ON m.id = p.medicine_id
LEFT JOIN medicine_stock ms ON m.id = ms.medicine_id
GROUP BY m.id, m.name, m.category, ms.quantity
ORDER BY prescription_count DESC;
```

#### 10. Get Student Emergency Contacts
```sql
SELECT 
    ec.name,
    ec.relationship,
    ec.phone_number,
    ec.alternate_phone,
    ec.address,
    ec.priority
FROM emergency_contacts ec
INNER JOIN student_details sd ON ec.student_id = sd.id
WHERE sd.user_id = ?
ORDER BY ec.priority;
```

---

## Database Indexes and Performance

### Existing Indexes

| Table | Index Name | Columns | Purpose |
|-------|-----------|---------|---------|
| users | PRIMARY | id | Primary key |
| users | idx_email | email | Fast email lookup |
| users | idx_username | username | Fast username lookup |
| users | idx_role | role | Role-based queries |
| student_details | PRIMARY | id | Primary key |
| student_details | idx_user_id | user_id | Join with users |
| student_details | idx_student_id | student_id_number | Student ID lookup |
| medical_records | PRIMARY | id | Primary key |
| medical_records | idx_student_id | student_id | Student records lookup |
| medical_records | idx_doctor_id | doctor_id | Doctor records lookup |
| medical_records | idx_visit_date | visit_date | Date range queries |
| medicines | PRIMARY | id | Primary key |
| medicines | idx_name | name | Medicine name search |
| medicines | idx_category | category | Category filtering |
| medicine_stock | PRIMARY | id | Primary key |
| medicine_stock | idx_medicine_id | medicine_id | Join with medicines |
| medicine_stock | idx_quantity | quantity | Stock level queries |
| prescriptions | PRIMARY | id | Primary key |
| prescriptions | idx_record_id | medical_record_id | Record prescriptions |
| prescriptions | idx_medicine_id | medicine_id | Medicine usage |
| prescriptions | idx_status | status | Status filtering |
| appointments | PRIMARY | id | Primary key |
| appointments | idx_student_id | student_id | Student appointments |
| appointments | idx_doctor_id | doctor_id | Doctor schedule |
| appointments | idx_date | appointment_date | Date range queries |
| queue | PRIMARY | id | Primary key |
| queue | unique_queue | queue_date, queue_number | Prevent duplicates |
| queue | idx_date | queue_date | Daily queue queries |

### Performance Optimization Tips

1. **Use Connection Pooling** (Already configured with HikariCP)
2. **Add Composite Indexes** for frequently joined columns
3. **Regular Index Maintenance**: `OPTIMIZE TABLE table_name;`
4. **Monitor Slow Queries**: Enable MySQL slow query log
5. **Use EXPLAIN** to analyze query performance

---

## Database Maintenance

### Backup Script
```bash
#!/bin/bash
# Daily backup script
mysqldump -u root -p smartmed_db > smartmed_backup_$(date +%Y%m%d).sql
```

### Restore Script
```bash
#!/bin/bash
# Restore from backup
mysql -u root -p smartmed_db < smartmed_backup_YYYYMMDD.sql
```

### Clean Old Queue Entries
```sql
DELETE FROM queue 
WHERE queue_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

---

## Conclusion

This database schema provides a comprehensive foundation for the SmartMed medical management system with:

✅ **13 interconnected tables**  
✅ **Proper normalization** (3NF)  
✅ **Referential integrity** with foreign keys  
✅ **Cascade delete handling**  
✅ **Optimized indexes** for performance  
✅ **Triggers** for automation  
✅ **Clear relationships** and connection types  

For questions or modifications, refer to the [API_ENDPOINTS.md](./API_ENDPOINTS.md) file for backend integration details.

---

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Database Version:** MySQL 8.0  
**Spring Boot Version:** 3.2.5
