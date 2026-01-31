import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Mail, Lock, Phone, Building2, Shield, GraduationCap, Users, Sparkles, Eye, EyeOff, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import mockData from '@/data/mock-data.json';

type UserRole = 'Owner' | 'Admin' | 'Teacher' | 'Parent' | 'Student';

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    role: UserRole;
    institute: string;
    agreeToTerms: boolean;
}

interface FormErrors {
    [key: string]: string;
}

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'Student',
        institute: '',
        agreeToTerms: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const passwordStrengthRegex = {
        minLength: /.{8,}/,
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*(),.?":{}|<>]/,
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        } else if (mockData.users.find((u) => u.email === formData.email)) {
            newErrors.email = 'This email is already registered';
        }

        // Phone validation
        const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordErrors = [];
            if (!passwordStrengthRegex.minLength.test(formData.password)) {
                passwordErrors.push('at least 8 characters');
            }
            if (!passwordStrengthRegex.uppercase.test(formData.password)) {
                passwordErrors.push('one uppercase letter');
            }
            if (!passwordStrengthRegex.lowercase.test(formData.password)) {
                passwordErrors.push('one lowercase letter');
            }
            if (!passwordStrengthRegex.number.test(formData.password)) {
                passwordErrors.push('one number');
            }
            if (!passwordStrengthRegex.special.test(formData.password)) {
                passwordErrors.push('one special character');
            }

            if (passwordErrors.length > 0) {
                newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
            }
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Institute validation
        if (!formData.institute.trim()) {
            newErrors.institute = 'Institute/Organization name is required';
        }

        // Terms & Conditions validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // In a real app, this would call the backend API
            // For now, we'll add the user to mock data (in production, backend handles this)
            const newUser = {
                id: mockData.users.length + 1,
                institute_id: 1, // Default institute ID
                name: formData.name,
                email: formData.email,
                password: formData.password, // In production, this is hashed on backend
                phone: formData.phone,
                role: formData.role,
                is_active: true,
                last_login_at: null,
                created_at: new Date().toISOString(),
            };

            // Add to mock data (in production, backend saves to database)
            mockData.users.push(newUser as any);

            setSuccessMessage('Account created successfully! Redirecting to login...');
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                role: 'Student',
                institute: '',
                agreeToTerms: false,
            });

            // Redirect to login after showing success message
            setTimeout(() => {
                navigate('/login');
            }, 1500);

            setIsLoading(false);
        }, 1200);
    };

    const roleOptions = [
        { value: 'Owner', label: 'Owner', icon: Shield, color: 'text-purple-600 dark:text-purple-400' },
        { value: 'Admin', label: 'Admin', icon: Building2, color: 'text-blue-600 dark:text-blue-400' },
        { value: 'Teacher', label: 'Teacher', icon: GraduationCap, color: 'text-green-600 dark:text-green-400' },
        { value: 'Parent', label: 'Parent', icon: Users, color: 'text-orange-600 dark:text-orange-400' },
        { value: 'Student', label: 'Student', icon: Sparkles, color: 'text-pink-600 dark:text-pink-400' },
    ];

    const getPasswordStrength = (): { strength: number; label: string; color: string } => {
        if (!formData.password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (passwordStrengthRegex.minLength.test(formData.password)) strength++;
        if (passwordStrengthRegex.uppercase.test(formData.password)) strength++;
        if (passwordStrengthRegex.lowercase.test(formData.password)) strength++;
        if (passwordStrengthRegex.number.test(formData.password)) strength++;
        if (passwordStrengthRegex.special.test(formData.password)) strength++;

        return strength <= 2
            ? { strength: 33, label: 'Weak', color: 'bg-red-500' }
            : strength <= 3
                ? { strength: 66, label: 'Fair', color: 'bg-yellow-500' }
                : { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-40 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                                <Building2 className="h-7 w-7 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                                    EduCoreOS
                                </h1>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Education Management Platform</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Your Account</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Join our platform and manage your educational institute efficiently
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3 animate-in slide-in-from-top">
                            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{successMessage}</p>
                        </div>
                    )}

                    {/* Signup Form Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full pl-12 pr-4 py-3 rounded-lg border bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400",
                                            errors.name
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'
                                        )}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.name && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full pl-12 pr-4 py-3 rounded-lg border bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400",
                                            errors.email
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'
                                        )}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full pl-12 pr-4 py-3 rounded-lg border bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400",
                                            errors.phone
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'
                                        )}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                {errors.phone && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>}
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">
                                    Select Your Role *
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {roleOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, role: option.value as UserRole }))}
                                            className={cn(
                                                "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                                formData.role === option.value
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                            )}
                                        >
                                            <option.icon className={cn('h-4 w-4', option.color)} />
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Institute */}
                            <div>
                                <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">
                                    Institute/Organization Name *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        name="institute"
                                        value={formData.institute}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full pl-12 pr-4 py-3 rounded-lg border bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400",
                                            errors.institute
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'
                                        )}
                                        placeholder="Your Institute Name"
                                    />
                                </div>
                                {errors.institute && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.institute}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">
                                    Password *
                                </label>
                                <div className="relative mb-2">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full pl-12 pr-12 py-3 rounded-lg border bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400",
                                            errors.password
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'
                                        )}
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mb-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={cn('h-full transition-all', passwordStrength.color)}
                                                    style={{ width: `${passwordStrength.strength}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Password must contain: uppercase, lowercase, number, special character & 8+ characters
                                        </p>
                                    </div>
                                )}

                                {errors.password && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold mb-2.5 text-slate-700 dark:text-white">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full pl-12 pr-12 py-3 rounded-lg border bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400",
                                            errors.confirmPassword
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'
                                        )}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <label className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        Terms & Conditions
                                    </button>{' '}
                                    and{' '}
                                    <button
                                        type="button"
                                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        Privacy Policy
                                    </button>
                                    *
                                </label>
                            </div>
                            {errors.agreeToTerms && <p className="text-xs text-red-600 dark:text-red-400">{errors.agreeToTerms}</p>}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Already have an account?</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        </div>

                        {/* Login Link */}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In Instead
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
                        © 2026 EduCoreOS • Multi-Tenant SaaS Platform
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
