import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/hooks/use-stores';
import { useTheme } from '@/context/ThemeContext';
import { User, Lock, Bell, Palette, Shield, Building2, Save, Camera } from 'lucide-react';
import { cn } from '@/utils/cn';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'preferences';

const SettingsPage: React.FC = () => {
    const { user } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Profile form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');

    // Security form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification preferences
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);

    // App preferences
    const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'auto'>(theme);
    const [language, setLanguage] = useState('en');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const tabs = [
        { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
        { id: 'security' as SettingsTab, label: 'Security', icon: Lock },
        { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
        { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Palette },
    ];

    return (
        <MainLayout>
            <div className="space-y-8 max-w-5xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Save className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">Settings saved successfully!</p>
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
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "text-foreground dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-700"
                                    )}
                                >
                                    <tab.icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-card border rounded-3xl p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Profile Information</h2>
                                        <p className="text-sm text-muted-foreground">Update your personal details and profile picture.</p>
                                    </div>

                                    {/* Profile Picture */}
                                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-secondary/30 dark:bg-slate-700/50 dark:border dark:border-slate-600">
                                        <div className="relative">
                                            <div className="h-24 w-24 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                                                {user?.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                                <Camera className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{user?.name}</h3>
                                            <p className="text-sm text-muted-foreground dark:text-slate-400">{user?.role} Account</p>
                                            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Profile Form */}
                                    <form onSubmit={handleSaveProfile} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Full Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Role</label>
                                            <input
                                                type="text"
                                                value={user?.role}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-700 dark:border-slate-600  dark:text-slate-400 cursor-not-allowed"
                                            />
                                            <p className="text-xs  dark:text-slate-400 mt-1">Contact support to change your role</p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
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
                                    </form>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Security Settings</h2>
                                        <p className="text-sm text-muted-foreground">Manage your password and security preferences.</p>
                                    </div>

                                    {/* Change Password Form */}
                                    <form onSubmit={handleChangePassword} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2  dark:text-white">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                placeholder="Enter your current password"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2  dark:text-white">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2  dark:text-white">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-4 w-4" />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Two-Factor Authentication */}
                                    <div className="pt-6 border-t dark:border-slate-700">
                                        <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30 dark:bg-slate-700/50 dark:border dark:border-slate-600">
                                            <Shield className="h-6 w-6 text-green-600 dark:text-green-400 mt-1" />
                                            <div className="flex-1">
                                                <h3 className="font-bold mb-1 dark:text-white">Two-Factor Authentication</h3>
                                                <p className="text-sm text-muted-foreground dark:text-slate-400 mb-3">Add an extra layer of security to your account.</p>
                                                <button className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-700 dark:hover:bg-green-600 transition-all">
                                                    Enable 2FA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Notification Preferences</h2>
                                        <p className="text-sm text-muted-foreground">Choose how you want to receive notifications.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <NotificationToggle
                                            label="Email Notifications"
                                            description="Receive updates via email"
                                            checked={emailNotifications}
                                            onChange={setEmailNotifications}
                                        />
                                        <NotificationToggle
                                            label="SMS Notifications"
                                            description="Receive important alerts via SMS"
                                            checked={smsNotifications}
                                            onChange={setSmsNotifications}
                                        />
                                        <NotificationToggle
                                            label="Push Notifications"
                                            description="Get real-time updates on your device"
                                            checked={pushNotifications}
                                            onChange={setPushNotifications}
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Preferences
                                    </button>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">App Preferences</h2>
                                        <p className="text-sm text-muted-foreground">Customize your experience.</p>
                                    </div>

                                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(e); }} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2  dark:text-white">Theme</label>
                                            <select
                                                value={appTheme}
                                                onChange={(e) => {
                                                    const newTheme = e.target.value as 'light' | 'dark' | 'auto';
                                                    setAppTheme(newTheme);
                                                    if (newTheme !== 'auto') {
                                                        setTheme(newTheme);
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            >
                                                <option value="light">Light Mode</option>
                                                <option value="dark">Dark Mode</option>
                                                <option value="auto">Auto (System)</option>
                                            </select>
                                            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-2">Light mode uses a bright interface, Dark mode reduces eye strain in low light environments.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2  dark:text-white">Language</label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            >
                                                <option value="en">English</option>
                                                <option value="gu">ગુજરાતી (Gujarati)</option>
                                                <option value="hi">हिन्दी (Hindi)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2  dark:text-white">Date Format</label>
                                            <select
                                                value={dateFormat}
                                                onChange={(e) => setDateFormat(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-input  dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Preferences
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const NotificationToggle: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 dark:bg-slate-700/50 dark:border dark:border-slate-600">
            <div>
                <p className="font-semibold text-sm text-foreground dark:text-white">{label}</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative h-7 w-12 rounded-full transition-all",
                    checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                )}
            >
                <span
                    className={cn(
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all",
                        checked ? "right-1" : "left-1"
                    )}
                />
            </button>
        </div>
    );
};

export default SettingsPage;
