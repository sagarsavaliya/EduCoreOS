// Example: How to use API integration in your components

import React, { useState } from 'react';
import {
    useStudents,
    useStudent,
    useCreateStudent,
    useUpdateStudent,
    useDeleteStudent,
} from '@/hooks/api/useStudents';
import { CreateStudentData } from '@/services/api/studentApi';

// ============================================
// EXAMPLE 1: Fetching Students List
// ============================================
export const StudentsListExample = () => {
    const { data, isLoading, isError, error } = useStudents({
        branch_id: 1,
        academic_year_id: 1,
        page: 1,
        per_page: 20,
    });

    if (isLoading) return <div>Loading students...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h2>Students ({data?.length})</h2>
            <ul>
                {data?.map((student) => (
                    <li key={student.id}>
                        {student.first_name} {student.last_name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ============================================
// EXAMPLE 2: Fetching Single Student
// ============================================
export const StudentDetailExample = ({ studentId }: { studentId: number }) => {
    const { data: student, isLoading, isError } = useStudent(studentId);

    if (isLoading) return <div>Loading student...</div>;
    if (isError) return <div>Student not found</div>;

    return (
        <div>
            <h2>{student?.first_name} {student?.last_name}</h2>
            <p>Email: {student?.email}</p>
            <p>Phone: {student?.phone}</p>
            <p>Admission No: {student?.admission_number}</p>
        </div>
    );
};

// ============================================
// EXAMPLE 3: Creating a Student
// ============================================
export const CreateStudentExample = () => {
    const createStudent = useCreateStudent();
    const [formData, setFormData] = useState<Partial<CreateStudentData>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createStudent.mutateAsync(formData as CreateStudentData);
            alert('Student created successfully!');
            // Form will be cleared automatically
        } catch (error) {
            alert('Failed to create student');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="First Name"
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <input
                placeholder="Last Name"
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending ? 'Creating...' : 'Create Student'}
            </button>
        </form>
    );
};

// ============================================
// EXAMPLE 4: Updating a Student
// ============================================
export const UpdateStudentExample = ({ studentId }: { studentId: number }) => {
    const { data: student } = useStudent(studentId);
    const updateStudent = useUpdateStudent();
    const [formData, setFormData] = useState<Partial<CreateStudentData>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateStudent.mutateAsync({ id: studentId, data: formData });
            alert('Student updated successfully!');
        } catch (error) {
            alert('Failed to update student');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="First Name"
                defaultValue={student?.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <input
                placeholder="Last Name"
                defaultValue={student?.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending ? 'Updating...' : 'Update Student'}
            </button>
        </form>
    );
};

// ============================================
// EXAMPLE 5: Deleting a Student
// ============================================
export const DeleteStudentExample = ({ studentId }: { studentId: number }) => {
    const deleteStudent = useDeleteStudent();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            await deleteStudent.mutateAsync(studentId);
            alert('Student deleted successfully!');
        } catch (error) {
            alert('Failed to delete student');
        }
    };

    return (
        <button onClick={handleDelete} disabled={deleteStudent.isPending}>
            {deleteStudent.isPending ? 'Deleting...' : 'Delete Student'}
        </button>
    );
};

// ============================================
// EXAMPLE 6: Search with Debouncing
// ============================================
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchStudents } from '@/hooks/api/useStudents';

export const SearchStudentsExample = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 500); // 500ms delay

    const { data: students, isLoading } = useSearchStudents(
        debouncedQuery,
        debouncedQuery.length > 2 // Only search if query is longer than 2 chars
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {isLoading && <div>Searching...</div>}

            {students && students.length > 0 && (
                <ul>
                    {students.map((student) => (
                        <li key={student.id}>
                            {student.first_name} {student.last_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ============================================
// EXAMPLE 7: Optimistic Updates
// ============================================
import { useQueryClient } from '@tanstack/react-query';
import { studentKeys } from '@/hooks/api/useStudents';

export const OptimisticUpdateExample = ({ studentId }: { studentId: number }) => {
    const queryClient = useQueryClient();
    const updateStudent = useUpdateStudent();

    const handleQuickUpdate = async (newName: string) => {
        // Optimistically update the UI before the API call
        queryClient.setQueryData(
            studentKeys.detail(studentId),
            (old: any) => ({
                ...old,
                data: {
                    ...old?.data,
                    first_name: newName,
                },
            })
        );

        try {
            // Make the actual API call
            await updateStudent.mutateAsync({
                id: studentId,
                data: { first_name: newName },
            });
        } catch (error) {
            // Rollback on error
            queryClient.invalidateQueries({ queryKey: studentKeys.detail(studentId) });
        }
    };

    return (
        <button onClick={() => handleQuickUpdate('John')}>
            Quick Update Name
        </button>
    );
};

// ============================================
// EXAMPLE 8: Pagination
// ============================================
export const PaginatedStudentsExample = () => {
    const [page, setPage] = useState(1);
    const perPage = 20;

    const { data, isLoading, isError } = useStudents({
        page,
        per_page: perPage,
    });

    return (
        <div>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error loading students</div>}

            {data && (
                <>
                    <ul>
                        {data.map((student) => (
                            <li key={student.id}>
                                {student.first_name} {student.last_name}
                            </li>
                        ))}
                    </ul>

                    <div>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button onClick={() => setPage((p) => p + 1)}>
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// ============================================
// EXAMPLE 9: Error Handling with Toast
// ============================================
import { toast } from 'react-hot-toast';

export const ErrorHandlingExample = () => {
    const createStudent = useCreateStudent();

    const handleSubmit = async (data: CreateStudentData) => {
        try {
            await createStudent.mutateAsync(data);
            toast.success('Student created successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to create student');
        }
    };

    return <div>Form here...</div>;
};

// ============================================
// EXAMPLE 10: Filtering with Multiple Params
// ============================================
export const FilteredStudentsExample = () => {
    const [filters, setFilters] = useState({
        branch_id: 1,
        standard_id: undefined as number | undefined,
        status: 'active',
        search: '',
    });

    const { data: students, isLoading } = useStudents(filters);

    return (
        <div>
            <select
                onChange={(e) =>
                    setFilters({ ...filters, standard_id: Number(e.target.value) })
                }
            >
                <option value="">All Standards</option>
                <option value="1">8th Standard</option>
                <option value="2">9th Standard</option>
                <option value="3">10th Standard</option>
            </select>

            <input
                placeholder="Search..."
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <ul>
                    {students?.map((student) => (
                        <li key={student.id}>
                            {student.first_name} {student.last_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
