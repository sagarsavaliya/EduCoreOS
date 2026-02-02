import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAcademicStore, useAuthStore } from '@/hooks/use-stores';
import { BookOpen, GraduationCap, Languages, Calendar, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

type Tab = 'standards' | 'subjects' | 'mediums' | 'academic-years';

const AcademicPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('standards');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const { user } = useAuthStore();
    const instituteId = user?.institute_id || 1;

    const { data: standards, isLoading: loadingStandards } = useMockQuery(['standards', instituteId.toString()], () => dal.getStandards(instituteId));
    const { data: subjects, isLoading: loadingSubjects } = useMockQuery(['subjects', instituteId.toString()], () => dal.getSubjects(instituteId));
    const { data: mediums, isLoading: loadingMediums } = useMockQuery(['mediums', instituteId.toString()], () => dal.getMediums(instituteId));
    const { data: academicYears, isLoading: loadingYears } = useMockQuery(['academic-years', instituteId.toString()], () => dal.getAcademicYearsByInstitute(instituteId));

    const tabs = [
        { id: 'standards' as Tab, label: 'Standards', icon: GraduationCap, count: standards?.length || 0 },
        { id: 'subjects' as Tab, label: 'Subjects', icon: BookOpen, count: subjects?.length || 0 },
        { id: 'mediums' as Tab, label: 'Mediums', icon: Languages, count: mediums?.length || 0 },
        { id: 'academic-years' as Tab, label: 'Academic Years', icon: Calendar, count: academicYears?.length || 0 },
    ];

    const handleAddNew = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleSubmit = (formData: any) => {
        // TODO: Implement API call to save data
        console.log('Saving:', formData);
        handleCloseModal();
        // Show success toast notification
    };

    const getModalTitle = () => {
        const action = selectedItem ? 'Edit' : 'Add';
        switch (activeTab) {
            case 'standards': return `${action} Standard`;
            case 'subjects': return `${action} Subject`;
            case 'mediums': return `${action} Medium`;
            case 'academic-years': return `${action} Academic Year`;
        }
    };

    return (
        <MainLayout>
            <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Academic Core</h1>
                        <p className="text-muted-foreground mt-1">Manage standards, subjects, mediums, and academic years.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add New
                    </button>
                </div>


                {/* Tabs - Professional Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tabs.map((tab, index) => {
                        const colors = [
                            { bg: 'bg-blue-50', text: 'text-blue-600', activeBg: 'bg-blue-600', border: 'border-blue-200' },
                            { bg: 'bg-emerald-50', text: 'text-emerald-600', activeBg: 'bg-emerald-600', border: 'border-emerald-200' },
                            { bg: 'bg-blue-50', text: 'text-indigo-600', activeBg: 'bg-blue-600', border: 'border-indigo-200' },
                            { bg: 'bg-amber-50', text: 'text-amber-600', activeBg: 'bg-amber-600', border: 'border-amber-200' }
                        ];
                        const color = colors[index];
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "p-6 rounded-xl transition-all text-left",
                                    isActive
                                        ? `${color.activeBg} text-white shadow-lg border border-transparent`
                                        : ` dark:bg-slate-800 border  dark:border-slate-700 hover:shadow-md`
                                )}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={cn(
                                        "h-12 w-12 rounded-lg flex items-center justify-center transition-colors shrink-0",
                                        isActive
                                            ? "bg-white/20"
                                            : `${color.bg}`
                                    )}>
                                        <tab.icon className={cn("h-6 w-6", isActive ? "text-white" : color.text)} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-xs font-semibold mb-1 truncate",
                                            isActive ? "text-white/90" : "dark:text-slate-300"
                                        )}>
                                            {tab.label}
                                        </p>
                                        <h4 className={cn("text-2xl font-bold leading-none", isActive ? "text-white" : "dark:text-white")}>{tab.count}</h4>
                                    </div>
                                </div>
                                <p className={cn(
                                    "text-xs font-medium",
                                    isActive ? "text-white/75" : "dark:text-slate-400"
                                )}>
                                    {tab.count === 1 ? 'item' : 'items'} total
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-card dark:bg-slate-800 border dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                    {activeTab === 'standards' && <StandardsTab data={standards} isLoading={loadingStandards} onEdit={handleEdit} />}
                    {activeTab === 'subjects' && <SubjectsTab data={subjects} isLoading={loadingSubjects} standards={standards} onEdit={handleEdit} />}
                    {activeTab === 'mediums' && <MediumsTab data={mediums} isLoading={loadingMediums} onEdit={handleEdit} />}
                    {activeTab === 'academic-years' && <AcademicYearsTab data={academicYears} isLoading={loadingYears} onEdit={handleEdit} />}
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={getModalTitle()}>
                <AcademicForm
                    type={activeTab}
                    data={selectedItem}
                    standards={standards}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </MainLayout>
    );
};

const StandardsTab: React.FC<{ data: any; isLoading: boolean; onEdit: (item: any) => void }> = ({ data, isLoading, onEdit }) => {
    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading standards...</div>;
    if (!data || data.length === 0) return <EmptyState message="No standards found. Add your first standard to get started." />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((standard: any, index: number) => {
                const colors = [
                    { bg: 'bg-blue-50', text: 'text-blue-600', number: 'bg-blue-600' },
                    { bg: 'bg-emerald-50', text: 'text-emerald-600', number: 'bg-emerald-600' },
                    { bg: 'bg-blue-50', text: 'text-indigo-600', number: 'bg-blue-600' },
                    { bg: 'bg-amber-50', text: 'text-amber-600', number: 'bg-amber-600' }
                ];
                const color = colors[index % colors.length];

                return (
                    <div
                        key={standard.id}
                        onClick={() => onEdit(standard)}
                        className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 hover:shadow-md  dark:hover:border-slate-600 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-12 w-12 rounded-lg ${color.number} flex items-center justify-center text-white font-bold text-lg`}>
                                {standard.name.match(/\d+/)?.[0] || standard.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base  dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{standard.name}</h3>
                                <p className="text-xs dark:text-slate-400">Order: {standard.sort_order}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold",
                                standard.status === 'active' ? " dark:bg-emerald-950/40  dark:text-emerald-300 border  dark:border-emerald-800" : " dark:bg-slate-700  dark:text-slate-300 border  dark:border-slate-600"
                            )}>
                                {standard.status}
                            </span>
                            <GraduationCap className="h-5 w-5  dark:text-slate-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const SubjectsTab: React.FC<{ data: any; isLoading: boolean; standards: any; onEdit: (item: any) => void }> = ({ data, isLoading, standards, onEdit }) => {
    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading subjects...</div>;
    if (!data || data.length === 0) return <EmptyState message="No subjects found. Add your first subject to get started." />;

    const getStandardName = (standardId: number) => {
        const standard = standards?.find((s: any) => s.id === standardId);
        return standard?.name || 'Unknown';
    };

    const subjectColors = [
        { bg: 'bg-blue-50', text: 'text-blue-600' },
        { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { bg: 'bg-blue-50', text: 'text-indigo-600' },
        { bg: 'bg-amber-50', text: 'text-amber-600' }
    ];

    return (
        <div className="space-y-3">
            {data.map((subject: any, index: number) => {
                const color = subjectColors[index % subjectColors.length];

                return (
                    <div
                        key={subject.id}
                        onClick={() => onEdit(subject)}
                        className="flex items-center justify-between p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 hover:shadow-md dark:hover:border-slate-600 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-lg ${color.bg} flex items-center justify-center`}>
                                <BookOpen className={`h-6 w-6 ${color.text}`} strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="font-bold text-base mb-1  dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{subject.name}</h3>
                                <p className="text-xs dark:text-slate-400">Code: <span className="font-semibold">{subject.code}</span> • Standard: <span className="font-semibold">{getStandardName(subject.standard_id)}</span></p>
                            </div>
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            subject.status === 'active' ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                        )}>
                            {subject.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const MediumsTab: React.FC<{ data: any; isLoading: boolean; onEdit: (item: any) => void }> = ({ data, isLoading, onEdit }) => {
    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading mediums...</div>;
    if (!data || data.length === 0) return <EmptyState message="No mediums found. Add your first medium to get started." />;

    const mediumColors = [
        { bg: 'bg-blue-50', text: 'text-indigo-600' },
        { bg: 'bg-blue-50', text: 'text-blue-600' },
        { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { bg: 'bg-amber-50', text: 'text-amber-600' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((medium: any, index: number) => {
                const color = mediumColors[index % mediumColors.length];

                return (
                    <div
                        key={medium.id}
                        onClick={() => onEdit(medium)}
                        className="p-5 rounded-xl dark:bg-slate-800 border  dark:border-slate-700 hover:shadow-md  dark:hover:border-slate-600 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-12 w-12 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}>
                                <Languages className={`h-6 w-6 ${color.text}`} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base mb-1  dark:text-white  dark:group-hover:text-blue-400 transition-colors truncate">{medium.name}</h3>
                                <p className="text-xs  dark:text-slate-400">Code: <span className="font-semibold">{medium.code}</span></p>
                            </div>
                        </div>
                        <span className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                            medium.status === 'active' ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                        )}>
                            {medium.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const AcademicYearsTab: React.FC<{ data: any; isLoading: boolean; onEdit: (item: any) => void }> = ({ data, isLoading, onEdit }) => {
    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading academic years...</div>;
    if (!data || data.length === 0) return <EmptyState message="No academic years found. Add your first academic year to get started." />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((year: any, index: number) => {
                const yearColors = [
                    { bg: 'bg-blue-50', text: 'text-indigo-600', icon: 'bg-blue-600' },
                    { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-600' },
                    { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-600' },
                    { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-600' }
                ];
                const color = yearColors[index % yearColors.length];

                return (
                    <div
                        key={year.id}
                        onClick={() => onEdit(year)}
                        className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 hover:shadow-md dark:hover:border-slate-600 transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-12 w-12 rounded-lg ${color.icon} flex items-center justify-center`}>
                                <Calendar className="h-6 w-6 text-white" strokeWidth={2} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{year.name}</h3>
                                <span className={cn(
                                    "inline-block px-3 py-1 mt-1 rounded-full text-xs font-semibold",
                                    year.status === 'active' ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                                )}>
                                    {year.status}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-lg  dark:bg-slate-700 border  dark:border-slate-700">
                                <span className=" dark:text-slate-300 font-medium">Start Date</span>
                                <span className="font-bold  dark:text-white">{new Date(year.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg  dark:bg-slate-700 border  dark:border-slate-700">
                                <span className=" dark:text-slate-300 font-medium">End Date</span>
                                <span className="font-bold  dark:text-white">{new Date(year.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg  dark:bg-slate-700 border  dark:border-slate-700">
                                <span className=" dark:text-slate-300 font-medium">Locked</span>
                                <span className={cn("font-bold", year.is_locked ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                                    {year.is_locked ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-16 border-2 border-dashed dark:border-slate-700 rounded-2xl">
        <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary dark:bg-slate-700 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground dark:text-slate-400" />
        </div>
        <p className="text-muted-foreground dark:text-slate-400 font-medium">{message}</p>
    </div>
);

const AcademicForm: React.FC<{
    type: Tab;
    data: any;
    standards?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}> = ({ type, data, standards, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(data || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'standards' && (
                <>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Standard Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g., 10th Standard"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Sort Order</label>
                        <input
                            type="number"
                            name="sort_order"
                            value={formData.sort_order || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="1"
                            required
                        />
                    </div>
                </>
            )}

            {type === 'subjects' && (
                <>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Subject Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g., Mathematics"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Subject Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g., MATH"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5 dark:text-slate-300">Standard</label>
                        <select
                            name="standard_id"
                            value={formData.standard_id || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            required
                        >
                            <option value="">Select Standard</option>
                            {standards?.map((std: any) => (
                                <option key={std.id} value={std.id}>{std.name}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {type === 'mediums' && (
                <>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Medium Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g., English"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Medium Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g., EN"
                            required
                        />
                    </div>
                </>
            )}

            {type === 'academic-years' && (
                <>
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Academic Year Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g., 2025-26"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                required
                            />
                        </div>
                    </div>
                </>
            )}

            <div>
                <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Status</label>
                <Select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    className=""
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </Select>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 border  dark:border-slate-600  dark:text-slate-200 rounded-lg font-semibold text-sm dark:hover:bg-slate-800  transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 border dark:border-slate-600 dark:bg-blue-500  rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
                >
                    {data ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
};

export default AcademicPage;
