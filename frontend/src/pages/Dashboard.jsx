import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { useTeam } from '../context/TeamContext';
import { 
    TrendingUp, Users, FolderOpen, MessageSquare, 
    Calendar, Clock, ArrowUp, ArrowDown, MoreVertical,
    Download, Eye, Star, Share2, ListTodo, CheckCircle,
    AlertCircle, UserPlus, Activity, PieChart as PieChartIcon,
    BarChart2, Zap, Target, Award, UserCheck, UserX,
    Loader2, Plus
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, LineChart,
    Line, Area, AreaChart, Legend, ComposedChart,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    
    // Initialize with default empty data to ensure charts render immediately
    const [statusData, setStatusData] = useState([
        { name: 'Pending', value: 0 },
        { name: 'In Progress', value: 0 },
        { name: 'Completed', value: 0 }
    ]);
    const [priorityData, setPriorityData] = useState([
        { name: 'High', value: 0 },
        { name: 'Medium', value: 0 },
        { name: 'Low', value: 0 }
    ]);
    const [weeklyData] = useState([
        { day: 'Mon', tasks: 12, completed: 8 },
        { day: 'Tue', tasks: 15, completed: 10 },
        { day: 'Wed', tasks: 8, completed: 5 },
        { day: 'Thu', tasks: 20, completed: 15 },
        { day: 'Fri', tasks: 18, completed: 12 },
        { day: 'Sat', tasks: 6, completed: 4 },
        { day: 'Sun', tasks: 4, completed: 3 }
    ]);
    const [performanceData] = useState([
        { subject: 'Productivity', A: 85, fullMark: 100 },
        { subject: 'Quality', A: 90, fullMark: 100 },
        { subject: 'Speed', A: 75, fullMark: 100 },
        { subject: 'Collaboration', A: 88, fullMark: 100 },
        { subject: 'Innovation', A: 70, fullMark: 100 },
        { subject: 'Reliability', A: 92, fullMark: 100 }
    ]);
    const [animated, setAnimated] = useState(false);

    const { authUser } = useAuth();
    const { tasks, getTasks, getTaskStatistics, loading: taskLoading } = useTask();
    const { teams, fetchTeams, loading: teamLoading } = useTeam();

    const chartRef = useRef(null);

    // Colors
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const STATUS_COLORS = {
        'Pending': '#f59e0b',
        'In Progress': '#3b82f6',
        'Completed': '#10b981'
    };
    const PRIORITY_COLORS = {
        'High': '#ef4444',
        'Medium': '#f59e0b',
        'Low': '#3b82f6'
    };

    // 1. Fetch data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([getTasks(), fetchTeams()]);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
        setTimeout(() => setAnimated(true), 300);
    }, []);

    // 2. Calculate stats safely when `tasks` array actually updates in context
    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const taskStats = getTaskStatistics(tasks) || {};

        // Update stats cards
        setStats([
            { icon: ListTodo, label: 'Total Tasks', value: taskStats.total?.toString() || '0', change: '+12.5%', positive: true, color: 'indigo' },
            { icon: CheckCircle, label: 'Completed', value: taskStats.completed?.toString() || '0', change: '+8.2%', positive: true, color: 'emerald' },
            { icon: Users, label: 'Team Members', value: teams.reduce((acc, team) => acc + (team.members?.length || 0), 0).toString(), change: '+3.1%', positive: true, color: 'purple' },
            { icon: MessageSquare, label: 'Messages', value: '1,293', change: '-2.4%', positive: false, color: 'orange' },
        ]);

        // Update chart data
        setStatusData([
            { name: 'Pending', value: taskStats.pending || 0 },
            { name: 'In Progress', value: taskStats.inProgress || 0 },
            { name: 'Completed', value: taskStats.completed || 0 }
        ]);

        setPriorityData([
            { name: 'High', value: taskStats.priorityBreakdown?.high || 0 },
            { name: 'Medium', value: taskStats.priorityBreakdown?.medium || 0 },
            { name: 'Low', value: taskStats.priorityBreakdown?.low || 0 }
        ]);

        // Update recent activity
        const recent = tasks.slice(0, 5).map(task => ({
            user: task.createdBy?.fullName || 'System',
            action: `created a new task: "${task.title}"`,
            time: new Date(task.createdAt).toLocaleDateString(),
            project: task.title
        }));
        setRecentActivity(recent);

    }, [tasks, teams, getTaskStatistics]);

    const isAdmin = authUser?.role === 'admin';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
                    {payload.map((item, index) => (
                        <p key={index} className="text-sm" style={{ color: item.color }}>
                            {item.name}: {item.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading || taskLoading || teamLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section with Role Badge */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                                Welcome back, {authUser?.fullName || 'User'}! 👋
                            </h1>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                isAdmin 
                                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}>
                                {isAdmin ? 'Admin' : 'Member'}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {isAdmin 
                                ? 'Here\'s your team\'s performance overview.'
                                : 'Here\'s what\'s happening with your tasks today.'
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <button 
                            onClick={() => { getTasks(); fetchTeams(); }}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Refresh
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats Grid with Animation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => {
                        const colorClasses = {
                            indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                            emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
                            orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        };
                        return (
                            <div 
                                key={index} 
                                className={`bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                                    animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-sm font-medium flex items-center gap-1 ${
                                        stat.positive ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                        {stat.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-3">{stat.value}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Distribution - Pie Chart */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                                Task Status
                            </h3>
                            <span className="text-xs text-slate-400">Distribution</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                        animationBegin={300}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {statusData.map((item, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: STATUS_COLORS[item.name] || COLORS[index] }}
                                    ></div>
                                    <span className="text-xs text-slate-600 dark:text-slate-300">
                                        {item.name} ({item.value})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Priority Distribution - Bar Chart */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-purple-500" />
                                Priority
                            </h3>
                            <span className="text-xs text-slate-400">Breakdown</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priorityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={60} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar 
                                        dataKey="value" 
                                        fill="#6366f1"
                                        animationDuration={1500}
                                        animationBegin={300}
                                        radius={[0, 4, 4, 0]}
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance Radar */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-500" />
                                Performance
                            </h3>
                            <span className="text-xs text-slate-400">Metrics</span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={performanceData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Performance"
                                        dataKey="A"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.4}
                                        animationDuration={1500}
                                        animationBegin={300}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Activity and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                Recent Activity
                            </h3>
                            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                View all
                                <ArrowUp className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 transition-all duration-300 ${
                                            animated ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                        }`}
                                        style={{ transitionDelay: `${index * 100 + 500}ms` }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                                            {activity.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                <span className="font-semibold">{activity.user}</span>
                                                {' '}{activity.action}
                                                <span className="text-indigo-600 dark:text-indigo-400"> {activity.project}</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-[1.02]">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                                    <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Create New Task</p>
                                    <p className="text-xs text-slate-400">Start a new task</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-[1.02]">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                                    <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Invite Members</p>
                                    <p className="text-xs text-slate-400">Add collaborators</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-[1.02]">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule Meeting</p>
                                    <p className="text-xs text-slate-400">Plan with your team</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-[1.02]">
                                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg">
                                    <BarChart2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">View Analytics</p>
                                    <p className="text-xs text-slate-400">Check performance</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Team Stats (Admin only) */}
                {isAdmin && teams.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Team Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {teams.map((team) => (
                                <div key={team._id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                        {team.name}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                                        {team.members?.length || 0}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Members</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;