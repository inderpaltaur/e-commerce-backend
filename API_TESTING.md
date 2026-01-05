# API Testing Guide for Admin System

This document provides curl commands and examples for testing the admin authentication system.

## Prerequisites

- Backend server running on `http://localhost:5000`
- Have `curl` or similar HTTP client installed
- For authenticated requests, you'll need a Firebase ID token

## 1. Setup Endpoints

### Check if Super Admin Exists

```bash
curl -X GET http://localhost:5000/api/setup/check-super-admin
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "exists": false
  }
}
```

### Create Super Admin (One-time Setup)

```bash
curl -X POST http://localhost:5000/api/setup/initialize-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "superadmin@example.com",
    "password": "SuperAdmin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Super admin account created successfully",
  "data": {
    "uid": "firebase-uid-here",
    "email": "superadmin@example.com",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

## 2. Authentication

### Sign In (Get Firebase ID Token)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "SuperAdmin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** for authenticated requests below.

## 3. Admin Request Endpoints

### Submit Admin Access Request

Replace `YOUR_TOKEN_HERE` with the Firebase ID token from login.

```bash
curl -X POST http://localhost:5000/api/admin-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "requestedRole": "admin",
    "reason": "I need admin access to manage the product inventory for our e-commerce platform. I have 5 years of experience in product management."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin access request submitted successfully",
  "data": {
    "requestId": "generated-id",
    "userId": "user-uid",
    "userName": "User Name",
    "userEmail": "user@example.com",
    "requestedRole": "admin",
    "reason": "I need admin access...",
    "status": "pending",
    "requestedAt": "2026-01-05T10:30:00.000Z",
    "reviewedBy": null,
    "reviewedAt": null,
    "notes": null
  }
}
```

### Get Current User's Request

```bash
curl -X GET http://localhost:5000/api/admin-requests/my-request \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "generated-id",
    "status": "pending",
    ...
  }
}
```

### Get All Admin Requests (Super Admin Only)

```bash
# Get all requests
curl -X GET http://localhost:5000/api/admin-requests \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN_HERE"

# Get only pending requests
curl -X GET "http://localhost:5000/api/admin-requests?status=pending" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN_HERE"

# Get with limit
curl -X GET "http://localhost:5000/api/admin-requests?status=pending&limit=10" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "requestId": "id-1",
      "userId": "user-id-1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "requestedRole": "admin",
      "reason": "...",
      "status": "pending",
      "requestedAt": "2026-01-05T10:30:00.000Z",
      ...
    }
  ],
  "count": 1
}
```

### Approve Admin Request (Super Admin Only)

```bash
curl -X PUT http://localhost:5000/api/admin-requests/REQUEST_ID_HERE/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN_HERE" \
  -d '{
    "notes": "Approved. Welcome to the admin team!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin request approved. User is now a admin",
  "data": {
    "requestId": "request-id",
    "userId": "user-id",
    "assignedRole": "admin"
  }
}
```

### Reject Admin Request (Super Admin Only)

```bash
curl -X PUT http://localhost:5000/api/admin-requests/REQUEST_ID_HERE/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN_HERE" \
  -d '{
    "notes": "Request denied. Please provide more details about your role."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin request rejected",
  "data": {
    "requestId": "request-id"
  }
}
```

## 4. Testing Error Cases

### Try to Submit Request Without Authentication

```bash
curl -X POST http://localhost:5000/api/admin-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requestedRole": "admin",
    "reason": "Test reason"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Try to Approve Request as Regular Admin (Not Super Admin)

```bash
curl -X PUT http://localhost:5000/api/admin-requests/REQUEST_ID/approve \
  -H "Authorization: Bearer REGULAR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Super admin access required"
}
```

### Try to Submit Request with Insufficient Reason

```bash
curl -X POST http://localhost:5000/api/admin-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "requestedRole": "admin",
    "reason": "Short"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "reason",
      "message": "Please provide a reason with at least 10 characters"
    }
  ]
}
```

### Try to Create Super Admin When One Already Exists

```bash
curl -X POST http://localhost:5000/api/setup/initialize-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Admin",
    "email": "another@example.com",
    "password": "Password123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Super admin already exists. This setup can only be run once."
}
```

## 5. Complete Testing Workflow

Here's a complete workflow to test the entire system:

```bash
# 1. Check if super admin exists
curl -X GET http://localhost:5000/api/setup/check-super-admin

# 2. Create super admin (if doesn't exist)
curl -X POST http://localhost:5000/api/setup/initialize-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "superadmin@test.com",
    "password": "SuperAdmin123"
  }'

# 3. Register a regular user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regular User",
    "email": "user@test.com",
    "password": "User123456"
  }'

# 4. Login as regular user and get token
USER_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "User123456"
  }' | jq -r '.data.token')

# 5. Submit admin request as regular user
REQUEST_ID=$(curl -X POST http://localhost:5000/api/admin-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "requestedRole": "admin",
    "reason": "I need admin access to manage products and inventory for our store."
  }' | jq -r '.data.requestId')

# 6. Login as super admin
SUPER_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@test.com",
    "password": "SuperAdmin123"
  }' | jq -r '.data.token')

# 7. View pending requests as super admin
curl -X GET "http://localhost:5000/api/admin-requests?status=pending" \
  -H "Authorization: Bearer $SUPER_TOKEN"

# 8. Approve the request
curl -X PUT http://localhost:5000/api/admin-requests/$REQUEST_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -d '{
    "notes": "Approved - Welcome to the team!"
  }'

# 9. Verify user can now access admin endpoints
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $USER_TOKEN"
```

## Notes

- Replace `YOUR_TOKEN_HERE` with actual Firebase ID tokens
- Replace `REQUEST_ID_HERE` with actual request IDs
- The examples use `jq` for JSON parsing (optional)
- Make sure the backend server is running before testing
- Check the backend console logs for detailed error messages

## Using Postman

You can also import these requests into Postman:

1. Create a new collection called "Admin System"
2. Add environment variables:
   - `base_url`: http://localhost:5000
   - `user_token`: (set after login)
   - `super_admin_token`: (set after super admin login)
3. Create requests for each endpoint
4. Use `{{base_url}}` and `{{user_token}}` in your requests

Example Postman request:
```
POST {{base_url}}/api/admin-requests
Headers:
  Content-Type: application/json
  Authorization: Bearer {{user_token}}
Body:
{
  "requestedRole": "admin",
  "reason": "Need admin access for product management"
}
```
