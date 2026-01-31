# Quick Start Guide: API Integration

This guide will help you quickly integrate the API into your EduCoreOS application.

## Step 1: Install Required Packages

```bash
npm install axios @tanstack/react-query @tanstack/react-query-devtools
```

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your backend API URL:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false  # Set to true to use mock data
```

## Step 3: Update main.tsx

Replace your existing `src/main.tsx` with:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
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

## Step 4: Update Your Components

### Example: Students Page

Before (using mock data):
```tsx
import mockData from '@/data/mock-data.json';

const StudentsPage = () => {
    const students = mockData.students;

    return (
        <div>
            {students.map(student => (
                <div key={student.id}>{student.first_name}</div>
            ))}
        </div>
    );
};
```

After (using API):
```tsx
import { useStudents } from '@/hooks/api/useStudents';

const StudentsPage = () => {
    const { data: students, isLoading, isError } = useStudents({
        branch_id: 1,
        academic_year_id: 1,
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading students</div>;

    return (
        <div>
            {students?.map(student => (
                <div key={student.id}>{student.first_name}</div>
            ))}
        </div>
    );
};
```

## Step 5: Create Operations (CRUD)

### Create a Student
```tsx
import { useCreateStudent } from '@/hooks/api/useStudents';

const CreateStudentForm = () => {
    const createStudent = useCreateStudent();

    const handleSubmit = async (formData) => {
        try {
            await createStudent.mutateAsync(formData);
            alert('Student created!');
        } catch (error) {
            alert('Failed to create student');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending ? 'Creating...' : 'Create'}
            </button>
        </form>
    );
};
```

### Update a Student
```tsx
import { useUpdateStudent } from '@/hooks/api/useStudents';

const UpdateStudentForm = ({ studentId }) => {
    const updateStudent = useUpdateStudent();

    const handleSubmit = async (formData) => {
        try {
            await updateStudent.mutateAsync({
                id: studentId,
                data: formData,
            });
            alert('Student updated!');
        } catch (error) {
            alert('Failed to update student');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending ? 'Updating...' : 'Update'}
            </button>
        </form>
    );
};
```

### Delete a Student
```tsx
import { useDeleteStudent } from '@/hooks/api/useStudents';

const DeleteStudentButton = ({ studentId }) => {
    const deleteStudent = useDeleteStudent();

    const handleDelete = async () => {
        if (!confirm('Are you sure?')) return;

        try {
            await deleteStudent.mutateAsync(studentId);
            alert('Student deleted!');
        } catch (error) {
            alert('Failed to delete student');
        }
    };

    return (
        <button onClick={handleDelete} disabled={deleteStudent.isPending}>
            {deleteStudent.isPending ? 'Deleting...' : 'Delete'}
        </button>
    );
};
```

## Step 6: Implement Search

```tsx
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchStudents } from '@/hooks/api/useStudents';

const StudentSearch = () => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);

    const { data: students, isLoading } = useSearchStudents(
        debouncedQuery,
        debouncedQuery.length > 2
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Search students..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {isLoading && <div>Searching...</div>}

            {students?.map(student => (
                <div key={student.id}>{student.first_name}</div>
            ))}
        </div>
    );
};
```

## Step 7: Add Loading & Error States

```tsx
const StudentsPage = () => {
    const { data, isLoading, isError, error } = useStudents();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-bold text-red-800">Error</h3>
                <p className="text-red-600">{error.message}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Your content */}
        </div>
    );
};
```

## Step 8: Authentication

### Login
```tsx
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await authService.login(credentials);

            if (response.success) {
                // Tokens are automatically stored
                navigate('/dashboard');
            }
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) => setCredentials({
                    ...credentials,
                    email: e.target.value
                })}
            />
            <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({
                    ...credentials,
                    password: e.target.value
                })}
            />
            <button type="submit">Login</button>
        </form>
    );
};
```

### Logout
```tsx
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};
```

## Common Patterns

### 1. Pagination
```tsx
const [page, setPage] = useState(1);

const { data } = useStudents({
    page,
    per_page: 20,
});
```

### 2. Filtering
```tsx
const [filters, setFilters] = useState({
    branch_id: 1,
    status: 'active',
});

const { data } = useStudents(filters);
```

### 3. Sorting
```tsx
const { data } = useStudents({
    sort: 'name',
    order: 'asc',
});
```

### 4. Conditional Fetching
```tsx
const { data } = useStudent(studentId, studentId > 0);
// Only fetches if studentId is greater than 0
```

## Troubleshooting

### CORS Errors
If you see CORS errors, configure your backend to allow requests from your frontend origin:
```js
// Backend (Express.js example)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
```

### 401 Unauthorized
- Check if token is being sent in headers
- Verify token hasn't expired
- Check backend authentication middleware

### Network Error
- Verify `VITE_API_BASE_URL` is correct
- Check if backend server is running
- Test API endpoints with Postman/Insomnia

### Data Not Updating
- Check if `invalidateQueries` is being called after mutations
- Verify React Query DevTools to see query states
- Check browser console for errors

## Next Steps

1. Create remaining React Query hooks for other modules
2. Update all pages to use API instead of mock data
3. Add proper error handling and loading states
4. Implement toast notifications for success/error messages
5. Add form validation
6. Implement file uploads (for photos)
7. Add pagination for large datasets
8. Implement caching strategies

## Useful Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- Example API Usage: `Requirement docs/EXAMPLE-API-USAGE.tsx`
- Full API Guide: `Requirement docs/API-INTEGRATION-GUIDE.md`
- Migration Checklist: `Requirement docs/API-MIGRATION-CHECKLIST.md`
