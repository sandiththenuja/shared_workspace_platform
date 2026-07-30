import React, { useState, useEffect, useContext } from 'react';
import { 
    Menu, X, Home, MessageSquare, Users, FolderOpen, BarChart3, 
    Settings, LogOut, Bell, Search, User, Plus, ChevronDown,
    Sun, Moon, Grid, Inbox, Calendar, FileText, Star, Clock,
    ChevronLeft, ChevronRight, MoreVertical, Activity, PieChart,
    Layout, Shield, Zap, HelpCircle, TrendingUp, UserPlus
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DashboardLayout = ({ children, activeTab = 'dashboard' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const { authUser } = useContext(AuthContext);

    const {logout} = useContext(AuthContext)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { icon: Home, label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
        { icon: MessageSquare, label: 'Chat', href: '/chat', id: 'chat' },
        { icon: Users, label: 'Team', href: '/team', id: 'team' },
        { icon: FolderOpen, label: 'Files', href: '/files', id: 'files' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics', id: 'analytics' },
        { icon: Calendar, label: 'Calendar', href: '/calendar', id: 'calendar' },
        { icon: Settings, label: 'Canvas', href: '/canvas', id: 'canvas' },
        { icon: Settings, label: 'Settings', href: '/profile', id: 'profile' },
    ];

    const recentItems = [
        { icon: FileText, label: 'Q4_Report.pdf', time: '2h ago' },
        { icon: MessageSquare, label: 'Team Chat', time: '4h ago' },
        { icon: FolderOpen, label: 'Design Assets', time: '1d ago' },
    ];

    const notifications = [
        { user: 'Sarah Kim', action: 'mentioned you in a comment', time: '5min ago' },
        { user: 'Alex Rivera', action: 'assigned you a task', time: '1h ago' },
        { user: 'Marcus Reed', action: 'uploaded a new file', time: '3h ago' },
    ];

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
            {/* ===== OVERLAY ===== */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* ===== SIDEBAR ===== */}
            <aside className={`
                fixed lg:relative z-50 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isSidebarOpen ? 'w-64' : 'w-20'}
                h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-700/80
                transition-all duration-300 ease-in-out
                flex flex-col overflow-hidden shadow-lg dark:shadow-slate-800/30
            `}>
                {/* Logo */}
                <div className={`flex items-center ${isSidebarOpen ? 'justify-between px-5' : 'justify-center'} h-16 border-b border-slate-200/80 dark:border-slate-700/80`}>
                    {isSidebarOpen ? (
                        <>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                    <span className="text-white font-bold text-sm">CW</span>
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-white text-lg">CollabNest</span>
                            </div>
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <span className="text-white font-bold text-sm">CW</span>
                            </div>
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                            >
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className={`flex items-center gap-3 p-4 border-b border-slate-200/80 dark:border-slate-700/80 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 flex-shrink-0">
                        JD
                    </div>
                    {isSidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">John Doe</p>
                            <p className="text-xs text-slate-400 truncate">john@collabnest.com</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                ${activeTab === item.id 
                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }
                                ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                                group relative
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${isSidebarOpen ? '' : 'group-hover:scale-110'} transition-transform`} />
                            {isSidebarOpen && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                            {!isSidebarOpen && (
                                <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                            {item.id === 'dashboard' && isSidebarOpen && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"></span>
                            )}
                        </a>
                    ))}
                </nav>

                {/* Recent */}
                {isSidebarOpen && (
                    <div className="px-3 py-2 border-t border-slate-200/80 dark:border-slate-700/80">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3 mb-2">Recent</p>
                        {recentItems.map((item, i) => (
                            <a key={i} href="#" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <item.icon className="w-4 h-4 text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.label}</p>
                                </div>
                                <span className="text-xs text-slate-400">{item.time}</span>
                            </a>
                        ))}
                    </div>
                )}

                {/* Bottom */}
                <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/80">
                    <button onClick={() => logout()} 
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                            text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                            ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                        `}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* ===== TOP NAVBAR ===== */}
                <header className={`sticky top-0 z-30 transition-all duration-300 ${
                    isScrolled 
                        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-sm' 
                        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md'
                } border-b border-slate-200/80 dark:border-slate-700/80`}>
                    <div className="flex items-center justify-between px-4 md:px-6 h-16">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>

                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>

                            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 min-w-[200px]">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    className="bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 flex-1"
                                />
                                <kbd className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Dark mode toggle */}
                            <button 
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isDarkMode ? (
                                    <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                ) : (
                                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                )}
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                            </div>

                            {/* Profile dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                        <img src={authUser?.profilePic} alt="" />
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-700/80">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{authUser.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{authUser.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <a href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <User className="w-4 h-4" />
                                                Profile
                                            </a>
                                            {/* <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </a> */}
                                            {/* <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <HelpCircle className="w-4 h-4" />
                                                Help
                                            </a> */}
                                        </div>
                                        <div className="border-t border-slate-200/80 dark:border-slate-700/80 py-1">
                                            <button onClick={() => logout()}  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile search */}
                    <div className="md:hidden px-4 pb-3">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 flex-1"
                            />
                        </div>
                    </div>
                </header>

                {/* ===== PAGE CONTENT ===== */}
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;