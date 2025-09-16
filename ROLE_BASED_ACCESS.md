# SmartMed Role-Based Access Control System

## Overview

The SmartMed application now implements a comprehensive role-based access control (RBAC) system to ensure proper security and user management.

## User Roles

### 1. **Student** (Self-Registration)
- **Registration**: Public registration through `/register` page
- **Access**: Can only access student-related features
- **Approval**: Automatically approved upon registration
- **Routes**: `/student/*`

### 2. **Admin** (System Administrator)
- **Registration**: Initial admin created automatically on first startup
- **Access**: Full system administration capabilities
- **Features**:
  - Create new users (Doctor, Pharmacy, Hospital Staff, Receptionist)
  - View all users and their status
  - Approve pending users
  - System overview and statistics
- **Routes**: `/admin/*`

### 3. **Doctor** (Admin-Managed)
- **Registration**: Only through admin dashboard
- **Access**: Medical consultation features
- **Approval**: Pre-approved when created by admin
- **Routes**: `/doctor/*`

### 4. **Pharmacy** (Admin-Managed)
- **Registration**: Only through admin dashboard
- **Access**: Medicine inventory and prescription management
- **Approval**: Pre-approved when created by admin
- **Routes**: `/inventory`, `/medicine-requests`, `/reports`, `/pharmacy/*`

### 5. **Hospital Staff** (Admin-Managed)
- **Registration**: Only through admin dashboard
- **Access**: Hospital management features
- **Approval**: Pre-approved when created by admin
- **Routes**: `/hospital-staff`

### 6. **Receptionist** (Admin-Managed)
- **Registration**: Only through admin dashboard
- **Access**: Patient queue and notification management
- **Approval**: Pre-approved when created by admin
- **Routes**: `/receptionist/*`

## Security Features

### Route Protection
- All user-specific routes are protected by role-based authentication
- Unauthorized access attempts redirect users to their appropriate dashboard
- Login required for all protected routes

### Registration Control
- Public registration **only allows Student accounts**
- All other roles must be created through admin dashboard
- Prevents unauthorized account creation

### Authentication Flow
- Enhanced login response includes user details (role, name, email, userId)
- Improved session management with user data storage
- Proper error handling for unapproved accounts

## Initial Setup

### Default Admin Account
When the application starts for the first time, it automatically creates an admin account:

- **Email**: `admin@smartmed.com`
- **Password**: `admin123`
- **⚠️ Important**: Change this password immediately after first login

### Database Schema Updates
The User model now includes:
- `isApproved`: Boolean flag for account approval status
- `createdByAdmin`: Tracks if account was created by admin

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Student registration only
- `POST /api/auth/login` - User authentication
- `GET /api/auth/users` - Get all users (may need protection)

### Admin-Only Endpoints
- `POST /api/auth/admin/create-user` - Create new user (Doctor/Pharmacy/Hospital Staff/Receptionist)
- `GET /api/auth/admin/pending-users` - Get users pending approval
- `POST /api/auth/admin/approve-user` - Approve pending user
- `GET /api/auth/admin/all-users` - Get all users with admin verification

## Usage Instructions

### For Students
1. Visit `/register` page
2. Select "Student" role (only option available)
3. Fill in registration details
4. Account is automatically approved
5. Login and access student features

### For Admins
1. Login with admin credentials
2. Access admin dashboard at `/admin/dashboard`
3. Use "Create User" tab to add new staff members
4. Monitor system overview and user statistics
5. Manage user approvals if needed

### For Other Staff
1. Account must be created by admin
2. Receive login credentials from admin
3. Login and access role-specific features
4. Account is pre-approved when created by admin

## Benefits

1. **Enhanced Security**: Role-based access prevents unauthorized access
2. **Proper User Management**: Centralized control through admin dashboard
3. **Scalable Architecture**: Easy to add new roles or modify permissions
4. **Audit Trail**: Track who created which accounts
5. **Professional Workflow**: Matches real-world hospital/clinic management

## Technical Implementation

- **Backend**: Spring Boot with enhanced AuthController
- **Frontend**: React with ProtectedRoute components
- **Database**: Updated User entity with approval fields
- **Security**: Role verification on both frontend and backend
- **Session Management**: Enhanced localStorage with user details

This system ensures that only authorized personnel can access appropriate system features while maintaining ease of use for legitimate users.