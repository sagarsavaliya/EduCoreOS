# API Integration Guide for EduCoreOS

## Overview
This guide will help you integrate the frontend with a backend API. Currently, the app uses `mock-data.json` for development. You'll transition to real API calls.

## Architecture Overview

```
Frontend (React + TypeScript)
    ↓
API Client Layer (axios/fetch)
    ↓
API Services (organized by module)
    ↓
Backend API (Node.js/Django/PHP - your choice)
    ↓
Database (MySQL/PostgreSQL/MongoDB)
```

## Step-by-Step Integration Plan

### Phase 1: Setup API Infrastructure (Week 1)

#### 1.1 Install Dependencies
```bash
npm install axios react-query
npm install @tanstack/react-query @tanstack/react-query-devtools
```

#### 1.2 Create API Configuration
- Create `src/config/api.ts` for base URL and headers
- Set up axios instance with interceptors
- Handle authentication tokens

#### 1.3 Create API Client
- Set up centralized error handling
- Add request/response interceptors
- Configure timeout and retry logic

### Phase 2: Create API Services (Week 2)

#### 2.1 Module-wise API Services
Create separate service files for each module:
- `src/services/studentService.ts`
- `src/services/teacherService.ts`
- `src/services/batchService.ts`
- `src/services/attendanceService.ts`
- `src/services/assessmentService.ts`
- `src/services/financeService.ts`
- `src/services/communicationService.ts`
- `src/services/timetableService.ts`

#### 2.2 Authentication Service
- Login/Logout
- Token refresh
- User profile

### Phase 3: Replace Mock Data with API Calls (Week 3-4)

#### 3.1 Update Zustand Stores
Replace mock data imports with API calls:
- Add loading states
- Add error handling
- Add data caching

#### 3.2 Update Components
Replace direct mock data usage with:
- React Query hooks
- Loading indicators
- Error boundaries

### Phase 4: Testing & Optimization (Week 5)

#### 4.1 Testing
- Test all CRUD operations
- Test error scenarios
- Test loading states

#### 4.2 Optimization
- Implement caching strategies
- Add optimistic updates
- Add pagination

## Directory Structure

```
src/
├── config/
│   └── api.ts                 # API configuration
├── lib/
│   └── axios.ts              # Axios instance
├── services/
│   ├── api/
│   │   ├── studentApi.ts     # Student API calls
│   │   ├── teacherApi.ts     # Teacher API calls
│   │   ├── batchApi.ts       # Batch API calls
│   │   ├── attendanceApi.ts  # Attendance API calls
│   │   ├── assessmentApi.ts  # Assessment API calls
│   │   ├── financeApi.ts     # Finance API calls
│   │   ├── communicationApi.ts
│   │   └── timetableApi.ts
│   └── authService.ts        # Authentication
├── hooks/
│   ├── api/
│   │   ├── useStudents.ts    # React Query hooks for students
│   │   ├── useTeachers.ts
│   │   ├── useBatches.ts
│   │   └── ...
│   └── use-stores.ts         # Zustand stores (update these)
├── types/
│   └── api.ts                # API response types
└── utils/
    ├── api-error.ts          # Error handling utilities
    └── api-helpers.ts        # Helper functions
```

## Backend API Requirements

### Required Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

#### Students
- `GET /api/students` - List students (with pagination, filters)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

#### Teachers
- `GET /api/teachers`
- `GET /api/teachers/:id`
- `POST /api/teachers`
- `PUT /api/teachers/:id`
- `DELETE /api/teachers/:id`

#### Batches
- `GET /api/batches`
- `GET /api/batches/:id`
- `POST /api/batches`
- `PUT /api/batches/:id`
- `DELETE /api/batches/:id`
- `GET /api/batches/:id/students` - Get batch students
- `POST /api/batches/:id/students` - Add student to batch
- `DELETE /api/batches/:id/students/:studentId` - Remove student

#### Attendance
- `GET /api/attendance` - Get attendance (by date, batch)
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance/stats` - Attendance statistics

#### Assessments
- `GET /api/tests` - List tests
- `GET /api/tests/:id` - Get test details
- `POST /api/tests` - Create test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test
- `GET /api/tests/:id/marks` - Get all marks for test
- `POST /api/marks` - Submit marks
- `PUT /api/marks/:id` - Update marks

#### Finance
- `GET /api/fee-structures` - List fee structures
- `GET /api/fee-ledgers` - Get fee ledger
- `GET /api/fee-payments` - List payments
- `POST /api/fee-payments` - Record payment
- `GET /api/students/:id/fee-summary` - Student fee summary

#### Communication
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment

#### Timetable
- `GET /api/timetable` - Get timetable (by batch, date range)
- `POST /api/timetable` - Create timetable entry
- `PUT /api/timetable/:id` - Update entry
- `DELETE /api/timetable/:id` - Delete entry

#### Academic Setup
- `GET /api/academic-years`
- `GET /api/standards`
- `GET /api/mediums`
- `GET /api/subjects`
- `GET /api/institutes`
- `GET /api/branches`

### API Response Format

All API responses should follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Success message",
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "phone": ["Invalid phone number format"]
    }
  }
}
```

## Authentication Flow

1. **Login**: User submits credentials
   - Frontend sends POST to `/api/auth/login`
   - Backend returns access token and refresh token
   - Frontend stores tokens in localStorage/sessionStorage
   - Frontend sets tokens in axios headers

2. **Authenticated Requests**:
   - Include `Authorization: Bearer {access_token}` header
   - Backend validates token
   - Backend returns data or 401 Unauthorized

3. **Token Refresh**:
   - When access token expires (401 response)
   - Frontend automatically calls `/api/auth/refresh`
   - Backend returns new access token
   - Frontend retries original request

4. **Logout**:
   - Frontend calls `/api/auth/logout`
   - Frontend clears tokens from storage
   - Frontend redirects to login page

## Query Parameters

### Pagination
```
GET /api/students?page=1&per_page=20
```

### Filtering
```
GET /api/students?branch_id=1&standard_id=2&status=active
```

### Sorting
```
GET /api/students?sort=name&order=asc
```

### Search
```
GET /api/students?search=John
```

### Date Range
```
GET /api/attendance?from=2026-01-01&to=2026-01-31
```

## Error Handling Strategy

1. **Network Errors**: Show offline message
2. **400 Bad Request**: Show validation errors
3. **401 Unauthorized**: Redirect to login
4. **403 Forbidden**: Show permission denied
5. **404 Not Found**: Show not found message
6. **500 Server Error**: Show generic error, retry option

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS Configuration**: Properly configure CORS on backend
3. **Token Security**:
   - Store tokens securely
   - Implement token expiry
   - Use refresh tokens
4. **Input Validation**: Validate on both frontend and backend
5. **Rate Limiting**: Implement on backend
6. **XSS Protection**: Sanitize user inputs
7. **CSRF Protection**: Use CSRF tokens for state-changing operations

## Testing Strategy

1. **Unit Tests**: Test API service functions
2. **Integration Tests**: Test API + component integration
3. **E2E Tests**: Test complete user flows
4. **API Mocking**: Use MSW (Mock Service Worker) for testing

## Migration Strategy

### Option 1: Gradual Migration (Recommended)
1. Start with one module (e.g., Students)
2. Build and test that module's API integration
3. Move to next module
4. Keep mock data as fallback

### Option 2: Big Bang Migration
1. Build all API services at once
2. Test thoroughly in staging
3. Switch all modules to API at once

### Option 3: Feature Flag Approach
1. Add feature flag to switch between mock and API
2. Test API in production with small user group
3. Gradually roll out to all users

## Performance Optimization

1. **Caching**: Use React Query's built-in caching
2. **Debouncing**: Debounce search inputs
3. **Lazy Loading**: Load data on demand
4. **Pagination**: Don't load all data at once
5. **Optimistic Updates**: Update UI before API response
6. **Background Refetching**: Keep data fresh

## Monitoring & Logging

1. **Error Tracking**: Use Sentry or similar
2. **Performance Monitoring**: Track API response times
3. **User Analytics**: Track feature usage
4. **API Logs**: Log all API calls for debugging

## Next Steps

1. Choose your backend technology stack
2. Design your database schema (can be based on mock-data.json structure)
3. Set up development environment
4. Create API documentation (Swagger/OpenAPI)
5. Start implementing endpoints
6. Test with Postman/Insomnia
7. Begin frontend integration

## Useful Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [REST API Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [JWT Authentication Guide](https://jwt.io/introduction)
