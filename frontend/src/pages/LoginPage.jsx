import React, { useContext, useState } from 'react';
import { 
    Mail, Lock, User, BookOpen, Sparkles, ArrowRight, CheckCircle,
    Menu, X, Calculator, Rocket, Users, Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);

    const { login } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            login('login', { email, password });
        } else {
            login('signup', { name, email, password, bio });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden relative z-10 flex flex-col md:flex-row">
                {/* Left Panel - Branding */}
                <div className="md:w-2/5 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 md:p-12 flex flex-col justify-between text-white hidden md:flex">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">CollabNest</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                            {isLogin ? 'Welcome Back!' : 'Join the Community'}
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            {isLogin 
                                ? 'Sign in to continue collaborating with your team.'
                                : 'Create your account and start collaborating with your team in real-time.'
                            }
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-white/80">
                            <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                            <span>Real-time collaboration</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/80">
                            <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                            <span>AI-powered workspace</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/80">
                            <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                            <span>Secure & encrypted</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/20">
                        <p className="text-xs text-white/60">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-1 text-white font-semibold hover:underline transition-all"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="md:w-3/5 p-8 md:p-12">
                    <div className="flex items-center justify-between md:hidden mb-6">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            <span className="text-lg font-bold text-indigo-500">CollabNest</span>
                        </div>
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-indigo-500 font-semibold hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {isLogin 
                                ? 'Sign in to continue your journey'
                                : 'Start collaborating with your team today'
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name - Only for Signup */}
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 text-sm placeholder:text-slate-400"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 text-sm placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 text-sm placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Bio - Only for Signup */}
                        {!isLogin && (
                            <div className="relative">
                                <textarea
                                    placeholder="Bio (tell us about yourself)"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 text-sm resize-none placeholder:text-slate-400"
                                />
                            </div>
                        )}

                        {/* Terms - Only for Signup */}
                        {!isLogin && (
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                <label className="text-xs text-slate-500">
                                    I agree to the Terms of Service and Privacy Policy
                                </label>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Mobile Switch */}
                        <div className="md:hidden text-center text-sm text-slate-500 mt-4">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-1 text-indigo-500 font-semibold hover:underline"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">or continue with</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="flex gap-3">
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm text-slate-600">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google
                            </button>
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm text-slate-600">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#333">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                GitHub
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;