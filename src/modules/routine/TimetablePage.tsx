import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Clock, User, BookOpen, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import mockData from '@/data/mock-data.json';
import { useAcademicStore } from '@/hooks/use-stores';

interface TimetableData {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    teacher_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    status: string;
}

interface EnrichedTimetableEntry extends TimetableData {
    batch_name: string;
    teacher_name: string;
    subject_name: string;
}

const TimetablePage: React.FC = () => {
    const { branchId, academicYearId } = useAcademicStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<number>(1);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [newEntry, setNewEntry] = useState({
        subject_id: '',
        teacher_id: '',
        day_of_week: '',
        start_time: '',
        end_time: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    // Get data from mock-data.json
    const allTimetable = (mockData as any).timetable as TimetableData[];
    const allBatches = (mockData as any).batches || [];
    const allTeachers = (mockData as any).teachers || [];
    const allSubjects = (mockData as any).subjects || [];

    // Filter and enrich timetable data
    const timetableEntries = useMemo((): EnrichedTimetableEntry[] => {
        return allTimetable
            .filter(t => t.branch_id === branchId && t.academic_year_id === academicYearId && t.batch_id === selectedBatch)
            .map(t => {
                const batch = allBatches.find((b: any) => b.id === t.batch_id);
                const teacher = allTeachers.find((tchr: any) => tchr.id === t.teacher_id);
                const subject = allSubjects.find((s: any) => s.id === t.subject_id);

                return {
                    ...t,
                    batch_name: batch?.name || 'Unknown Batch',
                    teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher',
                    subject_name: subject?.name || 'Unknown Subject'
                };
            });
    }, [allTimetable, allBatches, allTeachers, allSubjects, branchId, academicYearId, selectedBatch]);

    // Get available batches for the dropdown
    const availableBatches = useMemo(() => {
        return allBatches.filter((b: any) => b.branch_id === branchId);
    }, [allBatches, branchId]);

    const getSubjectColor = (subject: string) => {
        const colors: { [key: string]: string } = {
            'Mathematics': 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300',
            'Science': 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
            'English': 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300',
            'Social Science': 'bg-blue-100 dark:bg-blue-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300',
            'Computer Science': 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300',
            'Gujarati': 'bg-pink-100 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-pink-800 dark:text-pink-300'
        };
        return colors[subject] || 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300';
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5); // Convert "08:00:00" to "08:00"
    };

    const getEntriesForDayAndTime = (day: string, time: string) => {
        return timetableEntries.filter(entry => {
            const entryStartTime = formatTime(entry.start_time);
            const entryEndTime = formatTime(entry.end_time);
            const dayMatch = entry.day_of_week === day;
            const timeMatch = time >= entryStartTime && time < entryEndTime;
            return dayMatch && timeMatch;
        });
    };

    const handleAddEntry = (day: string, time: string) => {
        setSelectedDay(day);
        setSelectedTime(time);
        setNewEntry({
            ...newEntry,
            day_of_week: day,
            start_time: time + ':00'
        });
        setShowAddModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // In a real app, this would send data to an API
        console.log('New timetable entry:', {
            batch_id: selectedBatch,
            ...newEntry
        });

        // Reset form and close modal
        setNewEntry({
            subject_id: '',
            teacher_id: '',
            day_of_week: '',
            start_time: '',
            end_time: ''
        });
        setShowAddModal(false);

        // Show success message (in a real app, use a toast/notification)
        alert('Timetable entry added successfully!');
    };

    // Calculate total hours per week
    const totalHours = useMemo(() => {
        return timetableEntries.reduce((total, entry) => {
            const start = new Date(`2000-01-01T${entry.start_time}`);
            const end = new Date(`2000-01-01T${entry.end_time}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return total + hours;
        }, 0);
    }, [timetableEntries]);

    return (
        <div className="min-h-screen rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold  dark:text-white">Timetable</h1>
                            <p className="text-sm  dark:text-slate-400">Manage class schedules and timing</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Select
                            value={selectedBatch.toString()}
                            onChange={(e) => setSelectedBatch(Number(e.target.value))}
                        >
                            {availableBatches.map((batch: any) => (
                                <option key={batch.id} value={batch.id}>
                                    {batch.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Total Classes/Week</p>
                            <p className="text-2xl font-bold  dark:text-white">{timetableEntries.length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50  flex items-center justify-center">
                            <BookOpen className="h-6 w-6  text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Total Hours/Week</p>
                            <p className="text-2xl font-bold  dark:text-white">{totalHours.toFixed(1)}h</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Teachers Assigned</p>
                            <p className="text-2xl font-bold  dark:text-white">
                                {new Set(timetableEntries.map(t => t.teacher_id)).size}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Subjects</p>
                            <p className="text-2xl font-bold  dark:text-white">
                                {new Set(timetableEntries.map(t => t.subject_id)).size}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-amber-50  flex items-center justify-center">
                            <AlertCircle className="h-6 w-6  text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className=" dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-4 mb-6">
                <h3 className="text-sm font-semibold  dark:text-white mb-3">Subject Legend</h3>
                <div className="flex flex-wrap gap-3">
                    {['Mathematics', 'Science', 'English', 'Social Science', 'Computer Science', 'Gujarati'].map((subject) => (
                        <div key={subject} className="flex items-center gap-2">
                            <div className={cn("h-4 w-4 rounded border-2", getSubjectColor(subject))} />
                            <span className="text-sm  dark:text-slate-300">{subject}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-200">
                        {/* Header Row */}
                        <div className="grid grid-cols-[100px_repeat(6,1fr)] border-b  dark:border-slate-700  dark:bg-slate-700">
                            <div className="p-3 font-semibold text-sm  dark:text-slate-200 border-r  dark:border-slate-600">
                                Time
                            </div>
                            {days.map((day, idx) => (
                                <div key={idx} className="p-3 font-semibold text-sm  dark:text-slate-200 text-center border-r  dark:border-slate-600 last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Time Rows */}
                        {timeSlots.map((time, timeIdx) => (
                            <div key={timeIdx} className="grid grid-cols-[100px_repeat(6,1fr)] border-b  dark:border-slate-700 last:border-b-0">
                                <div className="p-3 text-sm font-medium  dark:text-slate-300 border-r  dark:border-slate-600  dark:bg-slate-700">
                                    {time}
                                </div>
                                {days.map((day, dayIdx) => {
                                    const entries = getEntriesForDayAndTime(day, time);
                                    const hasEntry = entries.length > 0;

                                    return (
                                        <div
                                            key={dayIdx}
                                            className={cn(
                                                "p-2 border  dark:border-slate-600 last:border-r-0 min-h-20",
                                                "dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                            )}
                                            onClick={() => !hasEntry && handleAddEntry(day, time)}
                                        >
                                            {hasEntry ? (
                                                <div className="space-y-1">
                                                    {entries.map((entry) => (
                                                        <div
                                                            key={entry.id}
                                                            className={cn(
                                                                "p-2 rounded-lg border-l-4 text-xs",
                                                                getSubjectColor(entry.subject_name)
                                                            )}
                                                        >
                                                            <p className="font-bold mb-1 dark:text-white">{entry.subject_name}</p>
                                                            <div className="flex items-center gap-1 text-xs opacity-90 dark:text-slate-300">
                                                                <User className="h-3 w-3" />
                                                                <span>{entry.teacher_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs opacity-90 dark:text-slate-300 mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Timetable Entry Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Timetable Entry"
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Select
                        label="Batch"
                        value={selectedBatch.toString()}
                        onChange={(e) => setSelectedBatch(Number(e.target.value))}
                        required
                    >
                        {availableBatches.map((batch: any) => (
                            <option key={batch.id} value={batch.id}>
                                {batch.name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Subject"
                        value={newEntry.subject_id}
                        onChange={(e) => setNewEntry({ ...newEntry, subject_id: e.target.value })}
                        required
                    >
                        <option value="">Select Subject</option>
                        {allSubjects.map((subject: any) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Teacher"
                        value={newEntry.teacher_id}
                        onChange={(e) => setNewEntry({ ...newEntry, teacher_id: e.target.value })}
                        required
                    >
                        <option value="">Select Teacher</option>
                        {allTeachers
                            .filter((t: any) => t.branch_id === branchId)
                            .map((teacher: any) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </option>
                            ))}
                    </Select>

                    <Select
                        label="Day of Week"
                        value={newEntry.day_of_week}
                        onChange={(e) => setNewEntry({ ...newEntry, day_of_week: e.target.value })}
                        required
                    >
                        <option value="">Select Day</option>
                        {days.map((day) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Time"
                            type="time"
                            value={newEntry.start_time.substring(0, 5)}
                            onChange={(e) => setNewEntry({ ...newEntry, start_time: e.target.value + ':00' })}
                            required
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={newEntry.end_time.substring(0, 5)}
                            onChange={(e) => setNewEntry({ ...newEntry, end_time: e.target.value + ':00' })}
                            required
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">Conflict Detection</p>
                                <p>The system will automatically check for teacher and room conflicts.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Add to Timetable
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TimetablePage;
