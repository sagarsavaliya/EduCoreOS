import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/use-stores';
import mockData from '@/data/mock-data.json';
import { LogIn, User, Lock, Building2, AlertCircle, GraduationCap, Shield, Users, Sparkles, Eye, EyeOff, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            // Find user in mock data
            const user = mockData.users.find(
                (u) => u.email === email && u.password === password
            );

            if (user) {
                if (!user.is_active) {
                    setError('Your account has been deactivated. Please contact support.');
                    setIsLoading(false);
                    return;
                }

                // Login successful
                login({
                    id: user.id,
                    institute_id: user.institute_id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role as any,
                    is_active: user.is_active,
                    last_login_at: user.last_login_at,
                    created_at: user.created_at,
                });

                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                setError('Invalid email or password. Please try again.');
            }
            setIsLoading(false);
        }, 800);
    };

    // Demo accounts for quick access
    const demoAccounts = [
        { role: 'Owner', email: 'dhruv@example.com', password: 'hash', icon: Shield, gradient: 'from-purple-500 to-purple-600' },
        { role: 'Admin', email: 'veer48@example.com', password: 'hash', icon: Building2, gradient: 'from-blue-500 to-blue-600' },
        { role: 'Teacher', email: 'unnati37@example.com"', password: 'hash', icon: GraduationCap, gradient: 'from-green-500 to-green-600' },
        { role: 'Parent', email: 'ven@example.com', password: 'hash', icon: Users, gradient: 'from-orange-500 to-orange-600' },
        { role: 'Student', email: 'vivaanmahajan@example.org', password: 'hash', icon: Sparkles, gradient: 'from-pink-500 to-pink-600' },
    ];

    const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError('');
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate API delay
        setTimeout(() => {
            // Check if email exists in mock data
            const userExists = mockData.users.find((u) => u.email === resetEmail);

            if (userExists) {
                setResetSuccess(true);
            } else {
                setResetSuccess(true); // Show success anyway for security (don't reveal if email exists)
            }
        }, 1000);
    };

    const closeForgotPassword = () => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetSuccess(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Subtle Professional Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-40 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Side - Branding & Features */}
                    <div className="hidden lg:flex flex-col space-y-8">
                        {/* Logo & Title */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                                    <Building2 className="h-9 w-9 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white">
                                        EduCoreOS
                                    </h1>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Education Management Platform</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                    Manage your institute with <span className="text-blue-600">confidence</span>
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                    Complete operating system for tuition centers, coaching institutes, and schools.
                                </p>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 transition-colors">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Multi-Role Access</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Role-based dashboards for everyone
                                </p>
                            </div>

                            <div className="group p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60 transition-colors">
                                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Secure & Reliable</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Enterprise-grade security
                                </p>
                            </div>

                            <div className="group p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 transition-colors">
                                    <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Academic Tools</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Attendance, tests, and more
                                </p>
                            </div>

                            <div className="group p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-950/60 transition-colors">
                                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Real-time Insights</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Analytics and reporting
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full max-w-md mx-auto space-y-5">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                                <Building2 className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                EduCoreOS
                            </h1>
                        </div>

                        {/* Login Card */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Welcome back!</h2>
                                <p className="text-slate-600 dark:text-slate-400">Sign in to continue to your dashboard</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">Email Address</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-white">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-4 w-4" />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Demo Accounts */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Quick Demo Access</h3>
                                <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-800">
                                    DEMO
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {demoAccounts.map((account) => (
                                    <button
                                        key={account.role}
                                        onClick={() => fillDemoCredentials(account.email, account.password)}
                                        className="group p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className={cn(
                                                "h-8 w-8 rounded-md flex items-center justify-center",
                                                account.gradient.includes('purple') ? 'bg-blue-100 dark:bg-blue-950/40' :
                                                    account.gradient.includes('blue') ? 'bg-blue-100 dark:bg-blue-950/40' :
                                                        account.gradient.includes('green') ? 'bg-emerald-100 dark:bg-emerald-950/40' :
                                                            account.gradient.includes('orange') ? 'bg-amber-100 dark:bg-amber-950/40' :
                                                                'bg-pink-100 dark:bg-pink-950/40'
                                            )}>
                                                <account.icon className={cn(
                                                    "h-4 w-4",
                                                    account.gradient.includes('purple') ? 'text-blue-600 dark:text-blue-400' :
                                                        account.gradient.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                                                            account.gradient.includes('green') ? 'text-emerald-600 dark:text-emerald-400' :
                                                                account.gradient.includes('orange') ? 'text-amber-600 dark:text-amber-400' :
                                                                    'text-pink-600 dark:text-pink-400'
                                                )} strokeWidth={2} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{account.role}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">{account.email.split('@')[0]}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Signup Link */}
                        <div className="text-center space-y-3">
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="w-full py-3 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center justify-center gap-2"
                            >
                                Create New Account
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                © 2026 EduCoreOS • Multi-Tenant SaaS Platform
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl max-w-md w-full transform animate-in zoom-in-95 duration-200">
                        {!resetSuccess ? (
                            <>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">We'll send you reset instructions</p>
                                    </div>
                                </div>

                                <form onSubmit={handleForgotPassword} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                                placeholder="Enter your email address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeForgotPassword}
                                            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Send Reset Link
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="text-center space-y-6">
                                    <div className="mx-auto h-16 w-16 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            If an account exists for <span className="font-semibold text-slate-900 dark:text-white">{resetEmail}</span>, you will receive password reset instructions shortly.
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeForgotPassword}
                                        className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
