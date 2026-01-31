# 🚀 Complete API Integration Guide for EduCoreOS

Welcome! This guide will help you integrate your EduCoreOS frontend with a backend API.

## 📚 Table of Contents

1. [Overview](#overview)
2. [What's Already Done](#whats-already-done)
3. [Quick Start (5 Steps)](#quick-start-5-steps)
4. [Backend Development](#backend-development)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Currently, your app uses `mock-data.json` for all data. You need to:

1. **Build a Backend API** - Create REST API endpoints
2. **Connect Frontend** - Replace mock data with API calls
3. **Deploy** - Host both frontend and backend

**Estimated Time**: 3-4 weeks

---

## ✅ What's Already Done

All frontend infrastructure is ready! Here's what's been created:

### Core Files (Ready to Use)
- ✅ `src/config/api.ts` - API configuration
- ✅ `src/lib/axios.ts` - HTTP client with auth
- ✅ `src/services/authService.ts` - Authentication
- ✅ All API services (students, teachers, batches, etc.)
- ✅ React Query hook example (`useStudents.ts`)
- ✅ Environment setup (`.env.example`)

### Documentation
- ✅ Complete integration guide
- ✅ Migration checklist
- ✅ 10+ code examples
- ✅ Backend starter code
- ✅ This README!

---

## ⚡ Quick Start (5 Steps)

### Step 1: Install Frontend Dependencies (2 minutes)

```bash
npm install axios @tanstack/react-query @tanstack/react-query-devtools
```

### Step 2: Set Up Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your backend URL
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### Step 3: Update main.tsx (2 minutes)

Replace `src/main.tsx` content with:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);
```

### Step 4: Set Up Backend (30 minutes)

See [Backend Development](#backend-development) section below.

### Step 5: Connect One Module (1 hour)

Start with Students module - see [Frontend Integration](#frontend-integration) section.

---

## 🔧 Backend Development

### Option A: Node.js + Express (Recommended for JavaScript developers)

**1. Create Backend Folder**
```bash
mkdir edu-core-backend
cd edu-core-backend
```

**2. Copy Template**
Copy `Requirement docs/backend-package.json` to `package.json`

**3. Install Dependencies**
```bash
npm install
```

**4. Copy Starter Code**
Copy `Requirement docs/backend-example-nodejs.js` to `server.js`

**5. Set Up Database**
```bash
# Install MySQL
# Create database: edu_core_os
# Run SQL from backend-example-nodejs.js (section 10)
```

**6. Create .env File**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=edu_core_os
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

**7. Run Server**
```bash
npm run dev
```

**8. Test with Postman**
```
POST http://localhost:3000/api/auth/login
Body: {
  "email": "rajesh@exceltuition.com",
  "password": "owner123"
}
```

### Option B: Other Technologies

- **PHP/Laravel**: See Laravel documentation
- **Python/FastAPI**: See FastAPI tutorial
- **Java/Spring Boot**: See Spring documentation

### Required API Endpoints

You need to create these endpoints (examples in `backend-example-nodejs.js`):

#### Authentication
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

#### Students
- `GET /api/students` (list with filters)
- `GET /api/students/:id`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

#### Similar endpoints for:
- Teachers
- Batches
- Attendance
- Tests & Marks
- Finance
- Communication
- Timetable

See `src/config/api.ts` for complete endpoint list.

---

## 💻 Frontend Integration

### Step 1: Create React Query Hooks

For each module, create a hooks file following the pattern in `useStudents.ts`:

**Example: Create `src/hooks/api/useTeachers.ts`**

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherApi from '@/services/api/teacherApi';

export const teacherKeys = {
    all: ['teachers'] as const,
    lists: () => [...teacherKeys.all, 'list'] as const,
    list: (params) => [...teacherKeys.lists(), params] as const,
};

export const useTeachers = (params) => {
    return useQuery({
        queryKey: teacherKeys.list(params),
        queryFn: () => teacherApi.getTeachers(params),
        select: (data) => data.data,
    });
};

export const useCreateTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => teacherApi.createTeacher(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
        },
    });
};

// Add useUpdateTeacher, useDeleteTeacher similar to useStudents.ts
```

### Step 2: Update Pages

**Before (using mock data):**
```tsx
import mockData from '@/data/mock-data.json';

const StudentsPage = () => {
    const students = mockData.students;
    // ...
};
```

**After (using API):**
```tsx
import { useStudents, useCreateStudent } from '@/hooks/api/useStudents';

const StudentsPage = () => {
    const { data: students, isLoading, isError } = useStudents({
        branch_id: branchId,
        academic_year_id: academicYearId,
    });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorMessage />;

    // Use students array as before
};
```

### Step 3: Implement CRUD Operations

See `Requirement docs/EXAMPLE-API-USAGE.tsx` for complete examples.

**Create:**
```tsx
const createStudent = useCreateStudent();
await createStudent.mutateAsync(formData);
```

**Update:**
```tsx
const updateStudent = useUpdateStudent();
await updateStudent.mutateAsync({ id: studentId, data: formData });
```

**Delete:**
```tsx
const deleteStudent = useDeleteStudent();
await deleteStudent.mutateAsync(studentId);
```

---

## 🧪 Testing

### Test Backend Endpoints (Postman/Insomnia)

1. **Test Login**
```
POST http://localhost:3000/api/auth/login
Body: { "email": "user@example.com", "password": "password" }
```

2. **Test Get Students**
```
GET http://localhost:3000/api/students
Headers: Authorization: Bearer YOUR_TOKEN
```

3. **Test Create Student**
```
POST http://localhost:3000/api/students
Headers: Authorization: Bearer YOUR_TOKEN
Body: { ... student data ... }
```

### Test Frontend

1. Start backend: `cd edu-core-backend && npm run dev`
2. Start frontend: `npm run dev`
3. Login at `http://localhost:5173/login`
4. Check React Query DevTools (bottom left icon)
5. Test CRUD operations

---

## 🌐 Deployment

### Frontend (Vercel - Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variable:
   - `VITE_API_BASE_URL` = Your backend URL
5. Deploy!

### Backend Options

**Option 1: Railway (Free tier available)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option 2: Render (Free tier)**
- Push to GitHub
- Connect at [render.com](https://render.com)
- Add environment variables
- Deploy

**Option 3: DigitalOcean ($5/month)**
- Create droplet
- SSH and set up Node.js
- Install MySQL
- Deploy code
- Use PM2 to keep running

---

## 🔍 Troubleshooting

### CORS Errors

**Problem:** "Access to XMLHttpRequest... has been blocked by CORS"

**Solution:** Add CORS middleware in backend:
```js
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));
```

### 401 Unauthorized

**Problem:** All API calls return 401

**Solution:**
1. Check if login is working
2. Verify token in localStorage
3. Check Authorization header format: `Bearer TOKEN`
4. Verify backend auth middleware

### Network Error

**Problem:** "Network Error" in console

**Solution:**
1. Check if backend is running: `http://localhost:3000/api`
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check backend console for errors

### Data Not Updating

**Problem:** UI doesn't update after create/update/delete

**Solution:**
1. Call `queryClient.invalidateQueries()` after mutations
2. Check React Query DevTools
3. Verify API is returning success

---

## 📖 Additional Resources

### Documentation Files
- `API-INTEGRATION-GUIDE.md` - Detailed guide
- `API-MIGRATION-CHECKLIST.md` - Step-by-step checklist
- `EXAMPLE-API-USAGE.tsx` - 10+ code examples
- `QUICK-START-API.md` - Quick reference
- `backend-example-nodejs.js` - Complete backend example

### External Resources
- [React Query Docs](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Tutorial](https://www.mysqltutorial.org/)

---

## 📞 Need Help?

1. **Check Documentation** - All files in `Requirement docs/`
2. **Review Examples** - `EXAMPLE-API-USAGE.tsx`
3. **Use DevTools** - React Query DevTools in browser
4. **Test Individually** - Test backend with Postman first
5. **Check Console** - Browser console + backend console

---

## 🎓 Learning Path

### Week 1: Backend Basics
- [ ] Set up MySQL database
- [ ] Create Node.js server
- [ ] Implement authentication endpoints
- [ ] Test with Postman

### Week 2: Backend CRUD
- [ ] Create Students endpoints
- [ ] Create Teachers endpoints
- [ ] Create Batches endpoints
- [ ] Test all endpoints

### Week 3: Frontend Integration
- [ ] Update main.tsx
- [ ] Create React Query hooks
- [ ] Update Students page
- [ ] Test CRUD operations

### Week 4: Complete Integration
- [ ] Update remaining pages
- [ ] Add error handling
- [ ] Add loading states
- [ ] Deploy to production

---

## ✨ Summary

**You Have:**
- ✅ Complete frontend API infrastructure
- ✅ Backend starter code
- ✅ Comprehensive documentation
- ✅ Code examples
- ✅ Migration guides

**You Need To:**
1. ✏️ Set up backend server
2. ✏️ Create database tables
3. ✏️ Implement API endpoints
4. ✏️ Create React Query hooks for all modules
5. ✏️ Update pages to use API
6. ✏️ Test and deploy

**Start Here:**
1. Read `QUICK-START-API.md`
2. Follow `backend-example-nodejs.js`
3. Use `EXAMPLE-API-USAGE.tsx` for frontend

**Good luck! 🚀**
