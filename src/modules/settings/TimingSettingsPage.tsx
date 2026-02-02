import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAuthStore } from '@/hooks/use-stores';
import { Clock, Calendar, Coffee, CalendarDays, Save, Plus, Trash2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    InstituteTimingSettings,
    BreakConfig,
    DayOfWeek,
    PeriodSlot,
    ALL_DAYS,
    PERIOD_DURATION_OPTIONS,
    GAP_DURATION_OPTIONS,
    DEFAULT_TIMING_SETTINGS,
} from '@/types/timing';

type TimingTab = 'school-hours' | 'period-setup' | 'breaks' | 'working-days';

const TimingSettingsPage: React.FC = () => {
    const { user } = useAuthStore();
    const instituteId = user?.institute_id || 1;
    const branchId = 1; // TODO: Get from context

    const { data: timingSettings, isLoading } = useMockQuery(
        ['timing-settings', branchId.toString()],
        () => dal.getTimingSettings(branchId)
    );

    const [activeTab, setActiveTab] = useState<TimingTab>('school-hours');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form state
    const [schoolStartTime, setSchoolStartTime] = useState(timingSettings?.school_start_time || DEFAULT_TIMING_SETTINGS.school_start_time);
    const [schoolEndTime, setSchoolEndTime] = useState(timingSettings?.school_end_time || DEFAULT_TIMING_SETTINGS.school_end_time);
    const [periodDuration, setPeriodDuration] = useState(timingSettings?.default_period_duration || DEFAULT_TIMING_SETTINGS.default_period_duration);
    const [gapBetweenPeriods, setGapBetweenPeriods] = useState(timingSettings?.gap_between_periods || DEFAULT_TIMING_SETTINGS.gap_between_periods);
    const [breaks, setBreaks] = useState<Omit<BreakConfig, 'id'>[]>(
        timingSettings?.breaks?.map((b: BreakConfig) => ({ name: b.name, after_period: b.after_period, duration: b.duration, applies_to: b.applies_to })) ||
        DEFAULT_TIMING_SETTINGS.breaks
    );
    const [workingDays, setWorkingDays] = useState<DayOfWeek[]>(
        (timingSettings?.working_days as DayOfWeek[]) || DEFAULT_TIMING_SETTINGS.working_days
    );

    // Update state when data loads
    React.useEffect(() => {
        if (timingSettings) {
            setSchoolStartTime(timingSettings.school_start_time);
            setSchoolEndTime(timingSettings.school_end_time);
            setPeriodDuration(timingSettings.default_period_duration);
            setGapBetweenPeriods(timingSettings.gap_between_periods);
            setBreaks(timingSettings.breaks?.map((b: BreakConfig) => ({
                name: b.name,
                after_period: b.after_period,
                duration: b.duration,
                applies_to: b.applies_to
            })) || DEFAULT_TIMING_SETTINGS.breaks);
            setWorkingDays((timingSettings.working_days as DayOfWeek[]) || DEFAULT_TIMING_SETTINGS.working_days);
        }
    }, [timingSettings]);

    // Calculate period slots based on settings
    const periodSlots = useMemo((): PeriodSlot[] => {
        const slots: PeriodSlot[] = [];
        let currentTime = parseTime(schoolStartTime);
        const endTime = parseTime(schoolEndTime);
        let periodNumber = 1;

        while (currentTime < endTime) {
            // Check if there's a break after the previous period
            const breakAfterPrevious = breaks.find(b => b.after_period === periodNumber - 1);
            if (breakAfterPrevious && periodNumber > 1) {
                slots.push({
                    period_number: -1,
                    start_time: formatTime(currentTime),
                    end_time: formatTime(currentTime + breakAfterPrevious.duration),
                    is_break: true,
                    break_name: breakAfterPrevious.name,
                });
                currentTime += breakAfterPrevious.duration;
            }

            // Add period
            const periodEndTime = currentTime + periodDuration;
            if (periodEndTime <= endTime + 15) { // Allow 15 min buffer
                slots.push({
                    period_number: periodNumber,
                    start_time: formatTime(currentTime),
                    end_time: formatTime(periodEndTime),
                    is_break: false,
                });
                currentTime = periodEndTime + gapBetweenPeriods;
                periodNumber++;
            } else {
                break;
            }
        }

        return slots;
    }, [schoolStartTime, schoolEndTime, periodDuration, gapBetweenPeriods, breaks]);

    const totalPeriods = periodSlots.filter(s => !s.is_break).length;
    const totalSchoolMinutes = parseTime(schoolEndTime) - parseTime(schoolStartTime);
    const totalSchoolHours = Math.floor(totalSchoolMinutes / 60);
    const remainingMinutes = totalSchoolMinutes % 60;

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleAddBreak = () => {
        const lastPeriod = Math.max(...breaks.map(b => b.after_period), 1);
        setBreaks([...breaks, {
            name: 'New Break',
            after_period: lastPeriod + 2,
            duration: 10,
            applies_to: 'all'
        }]);
    };

    const handleRemoveBreak = (index: number) => {
        setBreaks(breaks.filter((_, i) => i !== index));
    };

    const handleUpdateBreak = (index: number, field: keyof Omit<BreakConfig, 'id'>, value: any) => {
        const updated = [...breaks];
        updated[index] = { ...updated[index], [field]: value };
        setBreaks(updated);
    };

    const toggleWorkingDay = (day: DayOfWeek) => {
        if (workingDays.includes(day)) {
            setWorkingDays(workingDays.filter(d => d !== day));
        } else {
            setWorkingDays([...workingDays, day]);
        }
    };

    const tabs = [
        { id: 'school-hours' as TimingTab, label: 'School Hours', icon: Clock },
        { id: 'period-setup' as TimingTab, label: 'Period Setup', icon: Calendar },
        { id: 'breaks' as TimingTab, label: 'Breaks', icon: Coffee },
        { id: 'working-days' as TimingTab, label: 'Working Days', icon: CalendarDays },
    ];

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
                            Timing Configuration
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Configure school hours, periods, breaks, and working days for your institute.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Save className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                            Timing settings saved successfully!
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border rounded-2xl p-2 space-y-1 dark:bg-slate-800 dark:border-slate-700">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all",
                                        activeTab === tab.id
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                            : "text-foreground dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-700"
                                    )}
                                >
                                    <tab.icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-4 bg-card border rounded-2xl p-4 dark:bg-slate-800 dark:border-slate-700">
                            <h3 className="text-sm font-semibold mb-3 dark:text-white">Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Hours</span>
                                    <span className="font-semibold dark:text-white">
                                        {totalSchoolHours}h {remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Periods/Day</span>
                                    <span className="font-semibold dark:text-white">{totalPeriods}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Working Days</span>
                                    <span className="font-semibold dark:text-white">{workingDays.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Periods/Week</span>
                                    <span className="font-semibold dark:text-white">{totalPeriods * workingDays.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-card border rounded-3xl p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                            {/* School Hours Tab */}
                            {activeTab === 'school-hours' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1 dark:text-white">School Hours</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Set the start and end time for your school day.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 dark:text-white">
                                                School Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={schoolStartTime}
                                                onChange={(e) => setSchoolStartTime(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 dark:text-white">
                                                School End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={schoolEndTime}
                                                onChange={(e) => setSchoolEndTime(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                Total School Duration: {totalSchoolHours} hours {remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''}
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                                This duration will be divided into periods based on your period setup.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Period Setup Tab */}
                            {activeTab === 'period-setup' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1 dark:text-white">Period Setup</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Configure the duration of each period and gaps between them.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 dark:text-white">
                                                Period Duration (minutes)
                                            </label>
                                            <select
                                                value={periodDuration}
                                                onChange={(e) => setPeriodDuration(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            >
                                                {PERIOD_DURATION_OPTIONS.map(duration => (
                                                    <option key={duration} value={duration}>{duration} minutes</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 dark:text-white">
                                                Gap Between Periods (minutes)
                                            </label>
                                            <select
                                                value={gapBetweenPeriods}
                                                onChange={(e) => setGapBetweenPeriods(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            >
                                                {GAP_DURATION_OPTIONS.map(gap => (
                                                    <option key={gap} value={gap}>{gap} minutes</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                            Calculated Periods: <span className="font-bold">{totalPeriods} periods per day</span>
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
                                            Based on {totalSchoolHours}h {remainingMinutes > 0 ? `${remainingMinutes}m` : ''} school hours with {periodDuration}min periods and {gapBetweenPeriods}min gaps.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Breaks Tab */}
                            {activeTab === 'breaks' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold mb-1 dark:text-white">Breaks Configuration</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Add and configure breaks throughout the school day.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleAddBreak}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Break
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {breaks.map((breakItem, index) => (
                                            <div
                                                key={index}
                                                className="p-5 rounded-xl bg-secondary/30 dark:bg-slate-700/50 border dark:border-slate-600"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5 dark:text-slate-300">
                                                            Break Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={breakItem.name}
                                                            onChange={(e) => handleUpdateBreak(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border dark:border-slate-500 dark:bg-slate-600 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5 dark:text-slate-300">
                                                            After Period
                                                        </label>
                                                        <select
                                                            value={breakItem.after_period}
                                                            onChange={(e) => handleUpdateBreak(index, 'after_period', Number(e.target.value))}
                                                            className="w-full px-3 py-2 rounded-lg border dark:border-slate-500 dark:bg-slate-600 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                                                        >
                                                            {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(p => (
                                                                <option key={p} value={p}>Period {p}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5 dark:text-slate-300">
                                                            Duration (minutes)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={breakItem.duration}
                                                            onChange={(e) => handleUpdateBreak(index, 'duration', Number(e.target.value))}
                                                            min={5}
                                                            max={60}
                                                            className="w-full px-3 py-2 rounded-lg border dark:border-slate-500 dark:bg-slate-600 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleRemoveBreak(index)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                            title="Remove break"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {breaks.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed dark:border-slate-700 rounded-xl">
                                                <Coffee className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">No breaks configured. Add a break to get started.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Working Days Tab */}
                            {activeTab === 'working-days' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1 dark:text-white">Working Days</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Select the days of the week when classes are held.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                        {ALL_DAYS.map((day) => {
                                            const isSelected = workingDays.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => toggleWorkingDay(day)}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 font-semibold text-sm transition-all",
                                                        isSelected
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                            : "border-input dark:border-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500"
                                                    )}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-lg mb-1">{day.slice(0, 3)}</div>
                                                        <div className={cn(
                                                            "text-xs",
                                                            isSelected ? "text-blue-100" : "text-muted-foreground"
                                                        )}>
                                                            {isSelected ? 'Working' : 'Off'}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                            Working Days: <span className="font-bold">{workingDays.length} days per week</span>
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                                            {workingDays.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Period Slots Preview */}
                        <div className="bg-card border rounded-3xl p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                            <h3 className="text-lg font-bold mb-4 dark:text-white">Generated Period Slots Preview</h3>
                            <div className="overflow-x-auto">
                                <div className="flex gap-2 min-w-max pb-2">
                                    {periodSlots.map((slot, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "shrink-0 w-24 p-3 rounded-xl text-center",
                                                slot.is_break
                                                    ? "bg-amber-100 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700"
                                                    : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-xs font-semibold mb-1",
                                                slot.is_break
                                                    ? "text-amber-700 dark:text-amber-300"
                                                    : "text-blue-700 dark:text-blue-300"
                                            )}>
                                                {slot.is_break ? slot.break_name : `Period ${slot.period_number}`}
                                            </div>
                                            <div className={cn(
                                                "text-xs",
                                                slot.is_break
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-blue-600 dark:text-blue-400"
                                            )}>
                                                {slot.start_time}
                                            </div>
                                            <div className={cn(
                                                "text-xs",
                                                slot.is_break
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-blue-600 dark:text-blue-400"
                                            )}>
                                                {slot.end_time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// Helper functions
function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export default TimingSettingsPage;
