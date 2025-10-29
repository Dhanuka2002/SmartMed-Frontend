# 🔌 SmartMed API Endpoints Documentation

## 📚 Table of Contents
- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Student Details API](#student-details-api)
- [Authentication Endpoints](#authentication-endpoints)
- [Medicine Inventory API](#medicine-inventory-api)
- [Medical Records API](#medical-records-api)
- [Health Check](#health-check)
- [Error Codes](#error-codes)
- [Testing Examples](#testing-examples)

---

## 🌐 Base URLs

### Development Environment
```
Frontend: http://localhost:5173
Backend:  http://localhost:8081
Database: localhost:3307
```

### Docker Deployment
```
Frontend: http://localhost:80
Backend:  http://localhost:8081
Database: mysql:3306 (internal network)
```

### Production (Configure as needed)
```
Frontend: https://your-domain.com
Backend:  https://api.your-domain.com
Database: Internal network only
```

---

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the request header:

```http
Authorization: Bearer <your_jwt_token>
```

### Token Storage
- Frontend stores token in `localStorage` as `authToken`
- Token expiration: 24 hours (recommended)
- Refresh token: Not implemented yet

---

## 📋 Student Details API

### Save Student Medical Details

**Endpoint:** `POST /api/student-details/save`

**Description:** Save or update complete student medical examination report including personal details, family history, medical history, and vaccination records.

**Authentication:** Required

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body Schema:**
```json
{
  "firstName": "string (required, letters only)",
  "lastName": "string (required, letters only)",
  "fullName": "string (required)",
  "nic": "string (required, 12 digits for new format or 9 digits + V for old)",
  "studentRegistrationNumber": "string (required, format: 22IT0521)",
  "academicDivision": "string (required)",
  "email": "string (required, valid email format)",
  "profileImage": "string (required, base64 encoded image)",
  "dateOfBirth": "string (required, format: YYYY-MM-DD)",
  "positionOfFamily": "string (required: eldest/middle/youngest/only-child)",
  "gender": "string (required: male/female/other)",
  "lastAttendSchool": "string (required)",
  "religion": "string (required: buddhism/christianity/islam/hinduism/other)",
  "occupationOfFather": "string (required)",
  "singleMarried": "string (required: single/married/divorced/widowed)",
  "occupationOfMother": "string (required)",
  "age": "string (required, 16-100)",
  "homeAddress": "string (required)",
  "nationality": "string (required: sri-lankan/indian/british/american/other)",
  "telephoneNumber": "string (required, format: 0771234567)",
  "extraCurricularActivities": "string (required)",
  "emergencyName": "string (required)",
  "emergencyTelephone": "string (required, format: 0771234567)",
  "emergencyAddress": "string (required)",
  "emergencyRelationship": "string (required: parent/guardian/sibling/spouse/relative/friend)",
  "familyHistory": {
    "father": {
      "age": "string (optional)",
      "aliveState": "string (optional: alive-healthy/alive-sick/dead/unknown)",
      "deadAge": "string (optional)",
      "causeOfDeath": "string (optional)"
    },
    "mother": {
      "age": "string (optional)",
      "aliveState": "string (optional)",
      "deadAge": "string (optional)",
      "causeOfDeath": "string (optional)"
    },
    "brothers": {
      "age": "string (optional)",
      "aliveState": "string (optional)",
      "deadAge": "string (optional)",
      "causeOfDeath": "string (optional)"
    },
    "sisters": {
      "age": "string (optional)",
      "aliveState": "string (optional)",
      "deadAge": "string (optional)",
      "causeOfDeath": "string (optional)"
    },
    "others": {
      "age": "string (optional)",
      "aliveState": "string (optional)",
      "deadAge": "string (optional)",
      "causeOfDeath": "string (optional)"
    }
  },
  "medicalHistory": {
    "infectiousDiseases": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "wormInfestations": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "respiratory": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "circulatory": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "ent": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "eye": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "nervousSystem": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "surgical": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "misc": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "allergicHistory": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "menstrualHistory": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    },
    "disability": {
      "status": "string (required: yes/no)",
      "details": "string (required if status=yes)"
    }
  },
  "vaccinations": {
    "bcg": {
      "taken": "string (required: yes/no)",
      "date": "string (required if taken=yes, format: YYYY-MM-DD)"
    },
    "dpt": {
      "taken": "string (required: yes/no)",
      "date": "string (required if taken=yes)"
    },
    "mramur": {
      "taken": "string (required: yes/no)",
      "date": "string (required if taken=yes)"
    },
    "rubella": {
      "taken": "string (required: yes/no)",
      "date": "string (required if taken=yes)"
    },
    "hepatitisB": {
      "taken": "string (required: yes/no)",
      "date": "string (required if taken=yes)"
    },
    "chickenPox": {
      "taken": "string (required: yes/no)",
      "date": "string (required if taken=yes)"
    }
  },
  "certificationDate": "string (required, format: YYYY-MM-DD)",
  "signature": "string (required, student name)"
}
```

**Example Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "nic": "200012345678",
  "studentRegistrationNumber": "22IT0521",
  "academicDivision": "information-technology",
  "email": "john.doe@student.ac.lk",
  "profileImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "dateOfBirth": "2000-01-15",
  "positionOfFamily": "eldest",
  "gender": "male",
  "lastAttendSchool": "Royal College Colombo",
  "religion": "buddhism",
  "occupationOfFather": "Engineer",
  "singleMarried": "single",
  "occupationOfMother": "Teacher",
  "age": "24",
  "homeAddress": "123, Main Street, Colombo 07, Sri Lanka",
  "nationality": "sri-lankan",
  "telephoneNumber": "0771234567",
  "extraCurricularActivities": "Cricket, Debate Club, Music Band",
  "emergencyName": "Jane Doe",
  "emergencyTelephone": "0779876543",
  "emergencyAddress": "123, Main Street, Colombo 07",
  "emergencyRelationship": "parent",
  "familyHistory": {
    "father": {
      "age": "50",
      "aliveState": "alive-healthy",
      "deadAge": "",
      "causeOfDeath": ""
    },
    "mother": {
      "age": "48",
      "aliveState": "alive-healthy",
      "deadAge": "",
      "causeOfDeath": ""
    },
    "brothers": {
      "age": "22",
      "aliveState": "alive-healthy",
      "deadAge": "",
      "causeOfDeath": ""
    },
    "sisters": {
      "age": "",
      "aliveState": "",
      "deadAge": "",
      "causeOfDeath": ""
    },
    "others": {
      "age": "",
      "aliveState": "",
      "deadAge": "",
      "causeOfDeath": ""
    }
  },
  "medicalHistory": {
    "infectiousDiseases": {
      "status": "no",
      "details": ""
    },
    "wormInfestations": {
      "status": "no",
      "details": ""
    },
    "respiratory": {
      "status": "yes",
      "details": "Mild asthma, controlled with inhaler (Ventolin)"
    },
    "circulatory": {
      "status": "no",
      "details": ""
    },
    "ent": {
      "status": "no",
      "details": ""
    },
    "eye": {
      "status": "yes",
      "details": "Myopia -2.5D both eyes, wears prescription glasses"
    },
    "nervousSystem": {
      "status": "no",
      "details": ""
    },
    "surgical": {
      "status": "no",
      "details": ""
    },
    "misc": {
      "status": "no",
      "details": ""
    },
    "allergicHistory": {
      "status": "yes",
      "details": "Allergic to penicillin - causes severe rash"
    },
    "menstrualHistory": {
      "status": "no",
      "details": ""
    },
    "disability": {
      "status": "no",
      "details": ""
    }
  },
  "vaccinations": {
    "bcg": {
      "taken": "yes",
      "date": "2000-02-01"
    },
    "dpt": {
      "taken": "yes",
      "date": "2000-03-15"
    },
    "mramur": {
      "taken": "yes",
      "date": "2001-01-10"
    },
    "rubella": {
      "taken": "yes",
      "date": "2001-06-20"
    },
    "hepatitisB": {
      "taken": "yes",
      "date": "2000-04-05"
    },
    "chickenPox": {
      "taken": "no",
      "date": ""
    }
  },
  "certificationDate": "2024-10-28",
  "signature": "John Doe"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Student details saved successfully",
  "studentId": "STU2024001"
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed: Invalid NIC format"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "status": "error",
  "message": "Database connection failed"
}
```

---

## 🔑 Authentication Endpoints

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "12345",
    "name": "John Doe",
    "email": "john.doe@student.ac.lk",
    "role": "Student"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### Register

**Endpoint:** `POST /api/auth/register`

**Description:** Register new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@student.ac.lk",
  "password": "SecurePassword123",
  "role": "Student"
}
```

**Roles:**
- `Student`
- `Doctor`
- `Receptionist`
- `Hospital_Staff`
- `Pharmacy`
- `Admin`

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "userId": "12345"
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Email already exists"
}
```

---

### Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user and invalidate token

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### Change Password

**Endpoint:** `POST /api/auth/change-password`

**Description:** Change user password

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Current password is incorrect"
}
```

---

## 💊 Medicine Inventory API

### Get All Medicines

**Endpoint:** `GET /api/medicines`

**Description:** Retrieve all medicines in inventory

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Paracetamol",
    "genericName": "Acetaminophen",
    "category": "Pain Relief",
    "quantity": 500,
    "unit": "tablets",
    "expiryDate": "2025-12-31",
    "manufacturer": "PharmaCorp",
    "batchNumber": "BATCH2024001",
    "price": 2.50,
    "location": "Shelf A-1",
    "reorderLevel": 100,
    "status": "in-stock"
  },
  {
    "id": 2,
    "name": "Amoxicillin",
    "genericName": "Amoxicillin",
    "category": "Antibiotic",
    "quantity": 250,
    "unit": "capsules",
    "expiryDate": "2025-06-30",
    "manufacturer": "MediPharm",
    "batchNumber": "BATCH2024002",
    "price": 5.00,
    "location": "Shelf B-2",
    "reorderLevel": 50,
    "status": "in-stock"
  }
]
```

---

### Get Medicine by ID

**Endpoint:** `GET /api/medicines/{id}`

**Description:** Get details of a specific medicine

**Path Parameters:**
- `id` (integer, required): Medicine ID

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Paracetamol",
  "genericName": "Acetaminophen",
  "category": "Pain Relief",
  "quantity": 500,
  "unit": "tablets",
  "expiryDate": "2025-12-31",
  "manufacturer": "PharmaCorp",
  "batchNumber": "BATCH2024001",
  "price": 2.50,
  "location": "Shelf A-1",
  "reorderLevel": 100,
  "status": "in-stock",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-10-28T14:20:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Medicine not found"
}
```

---

### Add New Medicine

**Endpoint:** `POST /api/medicines`

**Description:** Add new medicine to inventory

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Ibuprofen",
  "genericName": "Ibuprofen",
  "category": "Anti-inflammatory",
  "quantity": 300,
  "unit": "tablets",
  "expiryDate": "2026-03-15",
  "manufacturer": "HealthPharma",
  "batchNumber": "BATCH2024003",
  "price": 3.50,
  "location": "Shelf C-3",
  "reorderLevel": 75
}
```

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Medicine added successfully",
  "medicine": {
    "id": 3,
    "name": "Ibuprofen",
    "quantity": 300,
    "status": "in-stock"
  }
}
```

---

### Update Medicine

**Endpoint:** `PUT /api/medicines/{id}`

**Description:** Update existing medicine details

**Path Parameters:**
- `id` (integer, required): Medicine ID

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 450,
  "price": 3.75,
  "location": "Shelf C-4",
  "status": "in-stock"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medicine updated successfully",
  "medicine": {
    "id": 3,
    "name": "Ibuprofen",
    "quantity": 450
  }
}
```

---

### Delete Medicine

**Endpoint:** `DELETE /api/medicines/{id}`

**Description:** Remove medicine from inventory

**Path Parameters:**
- `id` (integer, required): Medicine ID

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medicine deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Medicine not found"
}
```

---

### Check Low Stock

**Endpoint:** `GET /api/medicines/low-stock`

**Description:** Get list of medicines with quantity below reorder level

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "count": 2,
  "medicines": [
    {
      "id": 5,
      "name": "Insulin",
      "quantity": 15,
      "reorderLevel": 50,
      "status": "low-stock"
    },
    {
      "id": 8,
      "name": "Aspirin",
      "quantity": 30,
      "reorderLevel": 100,
      "status": "low-stock"
    }
  ]
}
```

---

### Check Expiring Medicines

**Endpoint:** `GET /api/medicines/expiring`

**Description:** Get medicines expiring within specified days

**Query Parameters:**
- `days` (integer, optional, default: 30): Number of days

**Example:**
```
GET /api/medicines/expiring?days=60
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "count": 3,
  "medicines": [
    {
      "id": 4,
      "name": "Vitamin C",
      "expiryDate": "2024-11-15",
      "daysUntilExpiry": 18,
      "quantity": 200
    },
    {
      "id": 7,
      "name": "Cough Syrup",
      "expiryDate": "2024-12-01",
      "daysUntilExpiry": 34,
      "quantity": 50
    }
  ]
}
```

---

## 🏥 Medical Records API

### Get Student Medical Record

**Endpoint:** `GET /api/medical-records/{studentId}`

**Description:** Retrieve complete medical record for a student

**Path Parameters:**
- `studentId` (string, required): Student ID

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "studentId": "STU2024001",
  "studentName": "John Doe",
  "email": "john.doe@student.ac.lk",
  "studentRegistrationNumber": "22IT0521",
  "academicDivision": "information-technology",
  "profileImage": "base64_encoded_image",
  "personalDetails": {
    "dateOfBirth": "2000-01-15",
    "age": "24",
    "gender": "male",
    "nationality": "sri-lankan",
    "nic": "200012345678",
    "telephoneNumber": "0771234567",
    "homeAddress": "123, Main Street, Colombo 07"
  },
  "medicalHistory": {
    "respiratory": {
      "status": "yes",
      "details": "Mild asthma, controlled with inhaler"
    },
    "eye": {
      "status": "yes",
      "details": "Myopia -2.5D both eyes"
    },
    "allergicHistory": {
      "status": "yes",
      "details": "Allergic to penicillin"
    }
  },
  "vaccinations": {
    "bcg": {
      "taken": "yes",
      "date": "2000-02-01"
    },
    "dpt": {
      "taken": "yes",
      "date": "2000-03-15"
    }
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "telephone": "0779876543",
    "address": "123, Main Street, Colombo 07",
    "relationship": "parent"
  },
  "qrCode": "base64_encoded_qr_code",
  "createdAt": "2024-10-28T10:30:00Z",
  "updatedAt": "2024-10-28T10:30:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Student record not found"
}
```

---

### Generate QR Code

**Endpoint:** `POST /api/medical-records/qr-generate`

**Description:** Generate QR code for student medical record

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "studentId": "STU2024001",
  "studentEmail": "john.doe@student.ac.lk"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "QR code generated successfully",
  "qrCodeUrl": "http://api.example.com/qr/STU2024001.png",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Student record not found"
}
```

---

### Search Medical Records

**Endpoint:** `GET /api/medical-records/search`

**Description:** Search medical records by various criteria

**Query Parameters:**
- `name` (string, optional): Student name
- `nic` (string, optional): NIC number
- `studentId` (string, optional): Student ID
- `regNumber` (string, optional): Registration number
- `division` (string, optional): Academic division
- `page` (integer, optional, default: 1): Page number
- `limit` (integer, optional, default: 10): Results per page

**Example Request:**
```
GET /api/medical-records/search?name=John&division=information-technology&page=1&limit=10
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "count": 2,
  "totalPages": 1,
  "currentPage": 1,
  "records": [
    {
      "studentId": "STU2024001",
      "studentName": "John Doe",
      "studentRegistrationNumber": "22IT0521",
      "academicDivision": "information-technology",
      "email": "john.doe@student.ac.lk",
      "hasQRCode": true
    },
    {
      "studentId": "STU2024002",
      "studentName": "John Smith",
      "studentRegistrationNumber": "22IT0522",
      "academicDivision": "information-technology",
      "email": "john.smith@student.ac.lk",
      "hasQRCode": false
    }
  ]
}
```

---

### Scan QR Code

**Endpoint:** `POST /api/medical-records/qr-scan`

**Description:** Retrieve medical record by scanning QR code

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "qrData": "STU2024001_ENCRYPTED_DATA"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "studentId": "STU2024001",
  "studentName": "John Doe",
  "medicalRecord": {
    /* Full medical record data */
  }
}
```

---

## 📊 Queue Management API

### Get Current Queue

**Endpoint:** `GET /api/queue/current`

**Description:** Get current queue status for all departments

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "queues": [
    {
      "department": "General Medicine",
      "currentNumber": 15,
      "waitingCount": 8,
      "averageWaitTime": "15 minutes"
    },
    {
      "department": "Dental",
      "currentNumber": 7,
      "waitingCount": 3,
      "averageWaitTime": "20 minutes"
    }
  ]
}
```

---

### Add to Queue

**Endpoint:** `POST /api/queue/add`

**Description:** Add student to department queue

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "studentId": "STU2024001",
  "department": "General Medicine",
  "priority": "normal"
}
```

**Priority Levels:**
- `normal` - Regular appointment
- `urgent` - Urgent case
- `emergency` - Emergency case

**Success Response (200 OK):**
```json
{
  "status": "success",
  "queueNumber": 16,
  "estimatedWaitTime": "15 minutes",
  "department": "General Medicine"
}
```

---

## 📞 Video Call API

### Create Video Room

**Endpoint:** `POST /api/video/create-room`

**Description:** Create Twilio video room for consultation

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roomName": "consultation-STU2024001",
  "doctorId": "DOC001",
  "studentId": "STU2024001"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "roomSid": "RM1234567890",
  "roomName": "consultation-STU2024001",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "https://smartmed.com/video/RM1234567890"
}
```

---

### Join Video Room

**Endpoint:** `POST /api/video/join-room`

**Description:** Get token to join existing video room

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roomName": "consultation-STU2024001",
  "participantName": "Dr. Jane Smith"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roomSid": "RM1234567890"
}
```

---

## 📋 Prescription API

### Create Prescription

**Endpoint:** `POST /api/prescriptions/create`

**Description:** Create new prescription for student

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "studentId": "STU2024001",
  "doctorId": "DOC001",
  "diagnosis": "Acute bronchitis",
  "medications": [
    {
      "medicineId": 1,
      "medicineName": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food"
    },
    {
      "medicineId": 5,
      "medicineName": "Cough Syrup",
      "dosage": "10ml",
      "frequency": "3 times daily",
      "duration": "5 days",
      "instructions": "Take after meals"
    }
  ],
  "notes": "Rest and drink plenty of fluids. Follow up after 1 week if symptoms persist.",
  "followUpDate": "2024-11-05"
}
```

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Prescription created successfully",
  "prescriptionId": "RX2024001",
  "prescriptionDate": "2024-10-28"
}
```

---

### Get Prescriptions by Student

**Endpoint:** `GET /api/prescriptions/student/{studentId}`

**Description:** Get all prescriptions for a student

**Path Parameters:**
- `studentId` (string, required): Student ID

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "count": 3,
  "prescriptions": [
    {
      "prescriptionId": "RX2024001",
      "date": "2024-10-28",
      "doctorName": "Dr. Jane Smith",
      "diagnosis": "Acute bronchitis",
      "medicationCount": 2,
      "status": "active"
    },
    {
      "prescriptionId": "RX2024002",
      "date": "2024-09-15",
      "doctorName": "Dr. John Wilson",
      "diagnosis": "Seasonal allergies",
      "medicationCount": 1,
      "status": "completed"
    }
  ]
}
```

---

## 📈 Reports API

### Get Inventory Report

**Endpoint:** `GET /api/reports/inventory`

**Description:** Get medicine inventory summary report

**Query Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)
- `format` (string, optional, default: json): Response format (json/pdf/excel)

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "reportDate": "2024-10-28",
  "summary": {
    "totalMedicines": 150,
    "totalValue": 25000.00,
    "lowStockItems": 12,
    "expiringItems": 5
  },
  "categories": [
    {
      "category": "Antibiotics",
      "count": 25,
      "value": 8500.00
    },
    {
      "category": "Pain Relief",
      "count": 40,
      "value": 3200.00
    }
  ]
}
```

---

### Get Student Health Report

**Endpoint:** `GET /api/reports/student-health`

**Description:** Generate health statistics report

**Query Parameters:**
- `division` (string, optional): Filter by academic division
- `year` (integer, optional): Academic year

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "totalStudents": 500,
  "withMedicalRecords": 450,
  "commonConditions": [
    {
      "condition": "Myopia",
      "count": 120,
      "percentage": 24
    },
    {
      "condition": "Asthma",
      "count": 45,
      "percentage": 9
    }
  ],
  "vaccinationCoverage": {
    "bcg": 98,
    "dpt": 96,
    "hepatitisB": 94
  }
}
```

---

## ❤️ Health Check

### Application Health Status

**Endpoint:** `GET /actuator/health`

**Description:** Check if the application is running and healthy

**Headers:** None required

**Success Response (200 OK):**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 336319328256,
        "threshold": 10485760
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "DOWN",
  "components": {
    "db": {
      "status": "DOWN",
      "details": {
        "error": "org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection"
      }
    }
  }
}
```

---

## ⚠️ Error Codes

| HTTP Code | Status | Description |
|-----------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request format or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions to access resource |
| 404 | Not Found | Requested resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable Entity | Request validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error occurred |
| 503 | Service Unavailable | Service temporarily unavailable |

---

### Standard Error Response Format

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "issue": "Specific issue description"
  },
  "timestamp": "2024-10-28T10:30:00Z",
  "path": "/api/student-details/save"
}
```

---

## 🧪 Testing Examples

### Using cURL

#### Health Check
```bash
curl -X GET http://localhost:8081/actuator/health
```

#### Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@student.ac.lk",
    "password": "password123"
  }'
```

#### Save Student Details (with token)
```bash
curl -X POST http://localhost:8081/api/student-details/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d @student_data.json
```

#### Get All Medicines
```bash
curl -X GET http://localhost:8081/api/medicines \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Student Medical Record
```bash
curl -X GET http://localhost:8081/api/medical-records/STU2024001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Using Postman

1. **Import Collection**: Import `postman_collection.json`
2. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:8081`
   - `token`: Your JWT token after login
3. **Test Flow**:
   - Health Check → Login → Save Student Details → Get Medical Records

---

### Using JavaScript (Fetch API)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:8081/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'john.doe@student.ac.lk',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  return data;
};

// Save Student Details
const saveStudentDetails = async (studentData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:8081/api/student-details/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(studentData)
  });
  
  return await response.json();
};

// Get Medicines
const getMedicines = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:8081/api/medicines', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

### Using Axios (React)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// API Functions
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    localStorage.removeItem('authToken');
    return response.data;
  }
};

export const studentAPI = {
  saveDetails: async (studentData) => {
    const response = await api.post('/api/student-details/save', studentData);
    return response.data;
  },
  
  getMedicalRecord: async (studentId) => {
    const response = await api.get(`/api/medical-records/${studentId}`);
    return response.data;
  },
  
  generateQR: async (studentId, email) => {
    const response = await api.post('/api/medical-records/qr-generate', {
      studentId,
      studentEmail: email
    });
    return response.data;
  }
};

export const medicineAPI = {
  getAll: async () => {
    const response = await api.get('/api/medicines');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/medicines/${id}`);
    return response.data;
  },
  
  add: async (medicineData) => {
    const response = await api.post('/api/medicines', medicineData);
    return response.data;
  },
  
  update: async (id, medicineData) => {
    const response = await api.put(`/api/medicines/${id}`, medicineData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/medicines/${id}`);
    return response.data;
  },
  
  getLowStock: async () => {
    const response = await api.get('/api/medicines/low-stock');
    return response.data;
  }
};
```

---

## 📊 Rate Limiting

**Current Status:** Not implemented

**Recommendations for Production:**
- Login attempts: 5 per 15 minutes per IP
- API calls: 100 per minute per user
- File uploads: 10 per hour per user
- QR generation: 20 per hour per user

---

## 🔒 Security Best Practices

### For API Consumers

1. **Token Management**
   - Store JWT tokens securely (httpOnly cookies or secure storage)
   - Never expose tokens in URLs or logs
   - Implement token refresh mechanism
   - Clear tokens on logout

2. **HTTPS**
   - Always use HTTPS in production
   - Validate SSL certificates
   - Use TLS 1.2 or higher

3. **Input Validation**
   - Validate all user inputs on client side
   - Sanitize data before sending to API
   - Use prepared statements for queries

4. **Error Handling**
   - Don't expose sensitive error details
   - Log errors securely
   - Show user-friendly error messages

5. **File Uploads**
   - Validate file types
   - Check file sizes (max 5MB for images)
   - Scan for malware

---

### For API Developers

1. **Authentication**
   - Use strong password hashing (BCrypt with cost factor 12+)
   - Implement JWT with proper expiration
   - Use refresh tokens for long sessions
   - Implement account lockout after failed attempts

2. **Authorization**
   - Implement role-based access control (RBAC)
   - Validate user permissions for each endpoint
   - Use principle of least privilege

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use TLS for data in transit
   - Implement field-level encryption for PII
   - Regular security audits

4. **SQL Injection Prevention**
   - Use parameterized queries
   - Use ORM frameworks (JPA/Hibernate)
   - Validate and sanitize inputs

5. **API Security**
   - Implement rate limiting
   - Use CORS properly
   - Add security headers (CSP, HSTS, etc.)
   - Regular dependency updates
   - Implement logging and monitoring

---

## 📝 Data Constraints

### Profile Image
- **Max size**: 5MB
- **Formats**: JPEG, PNG, GIF
- **Encoding**: Base64
- **Recommended dimensions**: 300x300 pixels

### Date Format
- **Format**: ISO 8601 (YYYY-MM-DD)
- **Example**: "2024-10-28"
- **Timezone**: UTC

### NIC Format
- **Old format**: 9 digits + V (e.g., "912345678V")
- **New format**: 12 digits (e.g., "199112345678")
- **Validation**: Check day of year (1-366 male, 501-866 female)

### Student Registration Number
- **Format**: 2 digits + 2 letters + 4 digits
- **Example**: "22IT0521"
- **Pattern**: `^[0-9]{2}[A-Z]{2}[0-9]{4}$`

### Telephone Numbers
- **Format**: 10 digits starting with 0
- **Example**: "0771234567"
- **Pattern**: `^07[0-9]{8}$`

### Email
- **Format**: Valid email format
- **Example**: "student@university.ac.lk"
- **Max length**: 254 characters

### Password
- **Min length**: 8 characters
- **Requirements**: 
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

---

## 🔄 API Versioning

**Current Version:** v1 (implicit in `/api/...`)

**Future Versions:**
- Consider adding version prefix: `/api/v2/...`
- Maintain backward compatibility for at least 6 months
- Document all breaking changes
- Provide migration guides

---

## 📖 Additional Resources

- **GitHub Repository**: [Your Repository URL]
- **Postman Collection**: Available in project root
- **Docker Documentation**: `README.Docker.md`
- **Quick Start Guide**: `QUICKSTART.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Docker Hub Guide**: `DOCKER_HUB_GUIDE.md`

---

## 🆘 Support & Contact

For API issues, questions, or feedback:
- **Technical Support**: support@smartmed.com
- **GitHub Issues**: [Repository Issues URL]
- **Documentation**: Check project README files
- **Emergency**: Contact system administrator

---

## 📅 Changelog

### Version 1.0.0 (2024-10-28)
- ✅ Initial API release
- ✅ Student details management endpoint
- ✅ Authentication endpoints (login, register, logout)
- ✅ Medicine inventory CRUD endpoints
- ✅ Medical records management
- ✅ QR code generation
- ✅ Queue management system
- ✅ Video call integration (Twilio)
- ✅ Prescription management
- ✅ Reports generation
- ✅ Health check endpoint

### Planned Features (v1.1.0)
- 🔄 Appointment scheduling
- 🔄 Email notifications
- 🔄 SMS alerts
- 🔄 Advanced search and filters
- 🔄 Export to PDF/Excel
- 🔄 Real-time notifications (WebSocket)
- 🔄 Two-factor authentication
- 🔄 API rate limiting
- 🔄 GraphQL support

---

**Last Updated:** October 28, 2024  
**API Version:** 1.0.0  
**Document Version:** 1.0.0  
**Maintained By:** SmartMed Development Team
