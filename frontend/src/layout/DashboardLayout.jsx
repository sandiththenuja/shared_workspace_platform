// layout/DashboardLayout.jsx - Updated
import React, { useState, useEffect, useContext } from 'react';
import { 
    Menu, X, Home, MessageSquare, Users, FolderOpen, BarChart3, 
    Settings, LogOut, Bell, Search, User, Plus, ChevronDown,
    Sun, Moon, Grid, Inbox, Calendar, FileText, Star, Clock,
    ChevronLeft, ChevronRight, MoreVertical, Activity, PieChart,
    Layout, Shield, Zap, HelpCircle, TrendingUp, UserPlus,
    LucidePaperBag,
    PaperBagIcon,
    PenTool
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children, activeTab = 'dashboard', onNavigate }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const { authUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Update active tab based on URL
    useEffect(() => {
        const path = location.pathname.replace('/', '');
        if (path && path !== activeTab) {
            const navItem = navItems.find(item => item.id === path);
            if (navItem && onNavigate) {
                onNavigate(path);
            }
        }
    }, [location.pathname]);

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
        { icon: PenTool, label: 'Canvas', href: '/canvas', id: 'canvas' },
        { icon: Settings, label: 'Profile', href: '/profile', id: 'profile' },
    ];

    const handleNavigation = (item) => {
        if (onNavigate) {
            onNavigate(item.id);
        }
        navigate(item.href);
        setIsMobileMenuOpen(false);
    };

    const recentItems = [
        { icon: FileText, label: 'Q4_Report.pdf', time: '2h ago' },
        { icon: MessageSquare, label: 'Team Chat', time: '4h ago' },
        { icon: FolderOpen, label: 'Design Assets', time: '1d ago' },
    ];
    
    return (
        <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
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
                                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
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
                            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <span className="text-white font-bold text-sm">CW</span>
                            </div>
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="absolute -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                            >
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        </>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full
                                    ${isActive 
                                        ? 'bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }
                                    ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                                    group relative
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isSidebarOpen ? '' : 'group-hover:scale-110'} transition-transform`} />
                                {isSidebarOpen && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                                {!isSidebarOpen && (
                                    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                                {isActive && isSidebarOpen && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"></span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Recent */}
                {/* {isSidebarOpen && (
                    <div className="px-3 py-2 border-t border-slate-200/80 dark:border-slate-700/80">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3 mb-2">Recent</p>
                        {recentItems.map((item, i) => (
                            <button key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
                                <item.icon className="w-4 h-4 text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.label}</p>
                                </div>
                                <span className="text-xs text-slate-400">{item.time}</span>
                            </button>
                        ))}
                    </div>
                )} */}

                {/* Bottom */}
                <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/80">
                    <button onClick={logout} 
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

                            {/* <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 min-w-[200px]">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    className="bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 flex-1"
                                />
                                <kbd className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
                            </div> */}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Dark mode toggle */}
                            {/* <button 
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isDarkMode ? (
                                    <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                ) : (
                                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                )}
                            </button> */}

                            {/* Notifications */}
                            {/* <div className="relative">
                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                            </div> */}

                            {/* Profile dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                        {authUser?.profilePic ? (
                                            <img src={authUser?.profilePic} alt="profile" className='w-8 h-8 rounded-full items-center justify-center' />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                {authUser?.fullName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-700/80">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{authUser?.fullName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{authUser?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <button 
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    handleNavigation(navItems.find(item => item.id === 'profile'));
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                                            >
                                                <User className="w-4 h-4" />
                                                Profile
                                            </button>
                                        </div>
                                        <div className="border-t border-slate-200/80 dark:border-slate-700/80 py-1">
                                            <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
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
                    {/* <div className="md:hidden px-4 pb-3">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 flex-1"
                            />
                        </div>
                    </div> */}
                </header>

                {/* ===== PAGE CONTENT ===== */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;