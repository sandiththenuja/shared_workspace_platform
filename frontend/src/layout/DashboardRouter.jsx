// components/DashboardRouter.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { Loader2 } from 'lucide-react';

// Lazy load components for better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Chat = lazy(() => import('../pages/Chat'));
const Team = lazy(() => import('../pages/Team'));
const Files = lazy(() => import('../pages/Files'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Calendar = lazy(() => import('../pages/Calendar'));
const CanvasDashboard = lazy(() => import('../pages/CanvasDashboard'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
    </div>
);

const DashboardRouter = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [cachedComponents, setCachedComponents] = useState({});

    // Navigation items with their components
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', component: Dashboard },
        { id: 'chat', label: 'Chat', icon: 'MessageSquare', component: Chat },
        { id: 'team', label: 'Team', icon: 'Users', component: Team },
        { id: 'files', label: 'Files', icon: 'FolderOpen', component: Files },
        { id: 'analytics', label: 'Analytics', icon: 'BarChart3', component: Analytics },
        { id: 'calendar', label: 'Calendar', icon: 'Calendar', component: Calendar },
        { id: 'canvas', label: 'Canvas', icon: 'Settings', component: CanvasDashboard },
        { id: 'profile', label: 'Profile', icon: 'User', component: ProfilePage },
    ];

    // Get current component
    const getCurrentComponent = () => {
        const navItem = navItems.find(item => item.id === currentPage);
        return navItem ? navItem.component : Dashboard;
    };

    // Handle navigation
    const handleNavigate = (pageId) => {
        setCurrentPage(pageId);
        // Cache the component if not already cached
        if (!cachedComponents[pageId]) {
            const navItem = navItems.find(item => item.id === pageId);
            if (navItem) {
                setCachedComponents(prev => ({
                    ...prev,
                    [pageId]: navItem.component
                }));
            }
        }
        // Update URL without full page reload
        window.history.pushState({ page: pageId }, '', `/${pageId}`);
    };

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = (event) => {
            if (event.state?.page) {
                setCurrentPage(event.state.page);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const CurrentComponent = getCurrentComponent();

    return (
        <DashboardLayout activeTab={currentPage} onNavigate={handleNavigate}>
            <Suspense fallback={<PageLoader />}>
                <CurrentComponent />
            </Suspense>
        </DashboardLayout>
    );
};

export default DashboardRouter;