# API Integration Migration Checklist

## Phase 1: Setup & Configuration ✅

### 1. Install Dependencies
```bash
npm install axios @tanstack/react-query @tanstack/react-query-devtools
npm install react-hot-toast  # For notifications
```

### 2. Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Update `VITE_API_BASE_URL` with your backend URL
- [ ] Set `VITE_USE_MOCK_DATA=false` when ready to use real API

### 3. Update main.tsx
- [ ] Import QueryClientProvider
- [ ] Wrap App with QueryClientProvider
- [ ] Add ReactQueryDevtools for development

Example:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

// Wrap your app
<QueryClientProvider client={queryClient}>
    <BrowserRouter>
        <App />
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Phase 2: Backend API Development 🚧

### Authentication Endpoints
- [ ] POST `/api/auth/login` - Login endpoint
- [ ] POST `/api/auth/logout` - Logout endpoint
- [ ] POST `/api/auth/refresh` - Refresh token
- [ ] GET `/api/auth/me` - Get current user

### Students Module
- [ ] GET `/api/students` - List students with pagination/filters
- [ ] GET `/api/students/:id` - Get single student
- [ ] POST `/api/students` - Create student
- [ ] PUT `/api/students/:id` - Update student
- [ ] DELETE `/api/students/:id` - Delete student

### Teachers Module
- [ ] GET `/api/teachers`
- [ ] GET `/api/teachers/:id`
- [ ] POST `/api/teachers`
- [ ] PUT `/api/teachers/:id`
- [ ] DELETE `/api/teachers/:id`

### Batches Module
- [ ] GET `/api/batches`
- [ ] GET `/api/batches/:id`
- [ ] POST `/api/batches`
- [ ] PUT `/api/batches/:id`
- [ ] DELETE `/api/batches/:id`
- [ ] GET `/api/batches/:id/students`
- [ ] POST `/api/batches/:id/students`

### Attendance Module
- [ ] GET `/api/attendance` - With date range filters
- [ ] POST `/api/attendance` - Mark attendance
- [ ] PUT `/api/attendance/:id` - Update attendance
- [ ] POST `/api/attendance/bulk` - Bulk mark
- [ ] GET `/api/attendance/stats` - Statistics

### Assessments Module
- [ ] GET `/api/tests`
- [ ] GET `/api/tests/:id`
- [ ] POST `/api/tests`
- [ ] PUT `/api/tests/:id`
- [ ] DELETE `/api/tests/:id`
- [ ] GET `/api/tests/:id/marks`
- [ ] POST `/api/marks`
- [ ] PUT `/api/marks/:id`

### Finance Module
- [ ] GET `/api/fee-structures`
- [ ] GET `/api/fee-ledgers`
- [ ] GET `/api/fee-payments`
- [ ] POST `/api/fee-payments`
- [ ] GET `/api/students/:id/fee-summary`

### Communication Module
- [ ] GET `/api/announcements`
- [ ] POST `/api/announcements`
- [ ] PUT `/api/announcements/:id`
- [ ] DELETE `/api/announcements/:id`
- [ ] GET `/api/assignments`
- [ ] POST `/api/assignments`
- [ ] PUT `/api/assignments/:id`

### Timetable Module
- [ ] GET `/api/timetable`
- [ ] POST `/api/timetable`
- [ ] PUT `/api/timetable/:id`
- [ ] DELETE `/api/timetable/:id`

### Academic Setup
- [ ] GET `/api/academic-years`
- [ ] GET `/api/standards`
- [ ] GET `/api/mediums`
- [ ] GET `/api/subjects`
- [ ] GET `/api/institutes`
- [ ] GET `/api/branches`

## Phase 3: Create API Services 📝

### For Each Module, Create:
- [ ] `src/services/api/studentApi.ts` ✅ (example created)
- [ ] `src/services/api/teacherApi.ts`
- [ ] `src/services/api/batchApi.ts`
- [ ] `src/services/api/attendanceApi.ts`
- [ ] `src/services/api/assessmentApi.ts`
- [ ] `src/services/api/financeApi.ts`
- [ ] `src/services/api/communicationApi.ts`
- [ ] `src/services/api/timetableApi.ts`

### Create React Query Hooks:
- [ ] `src/hooks/api/useStudents.ts` ✅ (example created)
- [ ] `src/hooks/api/useTeachers.ts`
- [ ] `src/hooks/api/useBatches.ts`
- [ ] `src/hooks/api/useAttendance.ts`
- [ ] `src/hooks/api/useAssessments.ts`
- [ ] `src/hooks/api/useFinance.ts`
- [ ] `src/hooks/api/useCommunication.ts`
- [ ] `src/hooks/api/useTimetable.ts`

## Phase 4: Update Components 🔄

### Students Page
- [ ] Replace mock data import with `useStudents()` hook
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement create student with `useCreateStudent()`
- [ ] Implement update student with `useUpdateStudent()`
- [ ] Implement delete student with `useDeleteStudent()`

### Teachers Page
- [ ] Replace mock data with API calls
- [ ] Add CRUD operations
- [ ] Add loading/error states

### Batches Page
- [ ] Replace mock data with API calls
- [ ] Add CRUD operations
- [ ] Implement student enrollment

### Attendance Page
- [ ] Replace mock data with API calls
- [ ] Implement bulk attendance marking
- [ ] Add date range filtering

### Assessments Page
- [ ] Replace mock data with API calls
- [ ] Implement test creation
- [ ] Implement marks entry

### Finance Page
- [ ] Replace mock data with API calls
- [ ] Implement payment recording
- [ ] Add fee summary

### Communication Page
- [ ] Replace mock data with API calls
- [ ] Implement announcement creation
- [ ] Implement assignment creation

### Timetable Page
- [ ] Replace mock data with API calls
- [ ] Implement timetable entry creation
- [ ] Add conflict detection

## Phase 5: Update Zustand Stores 🏪

### Academic Store
- [ ] Update to fetch data from API
- [ ] Add loading states
- [ ] Add error handling

### Auth Store
- [ ] Integrate with authService
- [ ] Handle login/logout
- [ ] Implement token refresh

## Phase 6: Testing 🧪

### Unit Tests
- [ ] Test API service functions
- [ ] Test React Query hooks
- [ ] Test error handling

### Integration Tests
- [ ] Test component + API integration
- [ ] Test authentication flow
- [ ] Test CRUD operations

### E2E Tests
- [ ] Test complete user workflows
- [ ] Test pagination
- [ ] Test filtering and search

## Phase 7: Production Preparation 🚀

### Performance
- [ ] Implement proper caching strategies
- [ ] Add pagination for large datasets
- [ ] Optimize bundle size
- [ ] Add service worker for offline support (optional)

### Error Handling
- [ ] Set up error boundary components
- [ ] Implement global error handler
- [ ] Add error logging (Sentry, etc.)
- [ ] Add user-friendly error messages

### Security
- [ ] Ensure HTTPS in production
- [ ] Implement proper CORS settings
- [ ] Add CSRF protection
- [ ] Implement rate limiting
- [ ] Secure token storage

### Monitoring
- [ ] Set up analytics
- [ ] Add performance monitoring
- [ ] Implement API response time tracking
- [ ] Set up error tracking

### Documentation
- [ ] Document API endpoints
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Update developer documentation
- [ ] Create deployment guide

## Migration Tips 💡

1. **Start Small**: Begin with one module (Students) and test thoroughly
2. **Feature Flags**: Use environment variables to toggle between mock and real API
3. **Backward Compatibility**: Keep mock data as fallback during transition
4. **Error Handling**: Always handle errors gracefully with user-friendly messages
5. **Loading States**: Show loading indicators for better UX
6. **Caching**: Use React Query's caching to reduce API calls
7. **Optimistic Updates**: Update UI immediately for better perceived performance
8. **Testing**: Test each module thoroughly before moving to the next

## Useful Commands 🛠️

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Run linter
npm run lint
```

## Support Resources 📚

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Axios Documentation](https://axios-http.com/docs/intro)
- API Integration Guide: `Requirement docs/API-INTEGRATION-GUIDE.md`
- Example Usage: `Requirement docs/EXAMPLE-API-USAGE.tsx`
