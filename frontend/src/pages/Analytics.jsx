// pages/Analytics.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, ArrowUp, ArrowDown, Download, Calendar,
    MessageSquare, CheckCircle, Clock as ClockIcon,
    ListTodo, TrendingUp, Activity, Loader2,
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useTask } from '../context/TaskContext';
import { useTeam } from '../context/TeamContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Analytics = () => {
    const { tasks, getTasks, getTaskStatistics } = useTask();
    const { teams, fetchTeams } = useTeam();

    const [loading, setLoading] = useState(true);
    const [chatStats, setChatStats] = useState({
        totalMessages: 0,
        unreadMessages: 0,
        activeConversations: 0,
        messagesPerDay: [],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([getTasks(), fetchTeams()]);
            setChatStats({
                totalMessages: 1293,
                unreadMessages: 47,
                activeConversations: 12,
                messagesPerDay: [
                    { day: 'Mon', count: 45 },
                    { day: 'Tue', count: 52 },
                    { day: 'Wed', count: 38 },
                    { day: 'Thu', count: 65 },
                    { day: 'Fri', count: 70 },
                    { day: 'Sat', count: 48 },
                    { day: 'Sun', count: 55 },
                ],
            });
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const taskStats = getTaskStatistics(tasks) || {};

    const completionRate =
        taskStats.total > 0
            ? Math.round((taskStats.completed / taskStats.total) * 100)
            : 0;

    const metrics = [
        {
            label: 'Total Tasks',
            value: taskStats.total?.toString() || '0',
            change: '+12.5%',
            positive: true,
            icon: ListTodo,
            color: 'indigo',
        },
        {
            label: 'Completed',
            value: taskStats.completed?.toString() || '0',
            change: '+8.2%',
            positive: true,
            icon: CheckCircle,
            color: 'emerald',
        },
        {
            label: 'Messages',
            value: chatStats.totalMessages.toLocaleString(),
            change: '+15.3%',
            positive: true,
            icon: MessageSquare,
            color: 'purple',
        },
        {
            label: 'Pending',
            value: taskStats.pending?.toString() || '0',
            change: '-3.1%',
            positive: false,
            icon: ClockIcon,
            color: 'orange',
        },
    ];

    const taskStatusData = [
        { label: 'Pending', value: taskStats.pending || 0, color: '#f59e0b' },
        { label: 'In Progress', value: taskStats.inProgress || 0, color: '#3b82f6' },
        { label: 'Completed', value: taskStats.completed || 0, color: '#10b981' },
    ];

    const maxTaskValue = useMemo(
        () => Math.max(...taskStatusData.map((d) => d.value), 1),
        [taskStatusData]
    );

    const priorityData = [
        { label: 'High', value: taskStats.priorityBreakdown?.high || 0, color: '#ef4444' },
        { label: 'Medium', value: taskStats.priorityBreakdown?.medium || 0, color: '#f59e0b' },
        { label: 'Low', value: taskStats.priorityBreakdown?.low || 0, color: '#3b82f6' },
    ];

    const maxPriorityValue = Math.max(...priorityData.map((d) => d.value), 1);

    const uniqueMembers = useMemo(() => {
        const all = teams.flatMap((t) => t.members || []);
        return Array.from(new Map(all.map((m) => [m._id, m])).values());
    }, [teams]);

    const colorClasses = {
        indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
    };

    const handleDownloadUserReport = async() => {
            try {
            const response = await axios.get('/api/reports/export/users', {
                responseType: "blob"
            })
    
            // create url for blob
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", "user_details.xlsx")
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
            } catch (error) {
            console.error("Error downloading", error);
            toast.error("Error to download try again")
            
            }
        }

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-5 md:space-y-6 pb-8">
                {/* ===== HEADER ===== */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            Analytics
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Track tasks, messages, and team performance
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={fetchData}
                            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">Last 7 days</span>
                            <span className="sm:hidden">7d</span>
                            <ArrowDown className="w-3.5 h-3.5 hidden sm:inline" />
                        </button>
                        {}
                        <button className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2" onClick={handleDownloadUserReport}>
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export Report</span>
                            <span className="sm:hidden">Export</span>
                        </button>
                    </div>
                </div>

                {/* ===== METRICS ===== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className={`p-2 rounded-lg ${colorClasses[metric.color]}`}>
                                    <metric.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div
                                    className={`flex items-center gap-0.5 text-xs sm:text-sm font-medium ${
                                        metric.positive
                                            ? 'text-emerald-500'
                                            : 'text-red-500'
                                    }`}
                                >
                                    {metric.positive ? (
                                        <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                    ) : (
                                        <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                    <span className="hidden sm:inline">{metric.change}</span>
                                </div>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-3">
                                {metric.value}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {metric.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ===== CHARTS ROW ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                    {/* Task Status Distribution */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                Task Status Distribution
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                {taskStatusData.map((d) => (
                                    <span key={d.label} className="inline-flex items-center gap-1.5">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: d.color }}
                                        />
                                        {d.label}: {d.value}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bar chart — heights scaled to max, not /100 */}
                        <div className="h-56 sm:h-64 flex items-end gap-2 sm:gap-3">
                            {taskStatusData.map((data, index) => {
                                const pct = (data.value / maxTaskValue) * 100;
                                return (
                                    <div key={index} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group min-w-0">
                                        <div className="relative w-full flex-1 flex items-end justify-center">
                                            <div
                                                className="w-full max-w-[80px] rounded-t-lg transition-all duration-500 hover:opacity-80 relative"
                                                style={{
                                                    height: `${Math.max(pct, data.value > 0 ? 8 : 0)}%`,
                                                    backgroundColor: data.color,
                                                    minHeight: data.value > 0 ? '12px' : '0px',
                                                }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {data.value}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center truncate w-full">
                                            {data.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
                            Priority Distribution
                        </h3>
                        <div className="space-y-4">
                            {priorityData.map((item) => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className="text-slate-600 dark:text-slate-300">
                                            {item.label}
                                        </span>
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            {item.value}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(item.value / maxPriorityValue) * 100}%`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                            <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="text-slate-600 dark:text-slate-300">
                                    Completion Rate
                                </span>
                                <span className="font-semibold text-emerald-500">
                                    {completionRate}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== TEAM MEMBERS ===== */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Team Members
                            <span className="text-sm font-normal text-slate-400">
                                ({uniqueMembers.length})
                            </span>
                        </h3>
                    </div>

                    {uniqueMembers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {uniqueMembers.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors min-w-0"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden shrink-0">
                                        {member.profilePic ? (
                                            <img
                                                src={member.profilePic}
                                                alt={member.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            member.fullName?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                            {member.fullName || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm">No team members found</p>
                        </div>
                    )}
                </div>

                {/* ===== ALL TASKS PROGRESS ===== */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            All Tasks Progress
                        </h3>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-12 px-4 text-slate-500 dark:text-slate-400">
                            <ListTodo className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm">No tasks yet</p>
                            <p className="text-xs mt-1">Create your first task to see it here</p>
                        </div>
                    ) : (
                        <>
                            {/* --- MOBILE: card list (< md) --- */}
                            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                                {tasks.map((task) => (
                                    <div key={task._id} className="p-4 space-y-2.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-medium text-slate-800 dark:text-white flex-1 min-w-0 break-words">
                                                {task.title}
                                            </p>
                                            <span
                                                className={`shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                                    task.status === 'Completed'
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                        : task.status === 'In Progress'
                                                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                }`}
                                            >
                                                {task.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                                    task.priority === 'High'
                                                        ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                                        : task.priority === 'Medium'
                                                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                        : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                }`}
                                            >
                                                {task.priority}
                                            </span>

                                            {task.assignedTo?.length > 0 ? (
                                                <div className="flex -space-x-2 ml-auto">
                                                    {task.assignedTo.slice(0, 3).map((user) => (
                                                        <div
                                                            key={user._id}
                                                            className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] border-2 border-white dark:border-slate-900 overflow-hidden"
                                                        >
                                                            {user.profilePic ? (
                                                                <img
                                                                    src={user.profilePic}
                                                                    alt={user.fullName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                user.fullName?.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                    ))}
                                                    {task.assignedTo.length > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[10px] font-medium border-2 border-white dark:border-slate-900 text-slate-700 dark:text-slate-200">
                                                            +{task.assignedTo.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 ml-auto">
                                                    Unassigned
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all"
                                                    style={{ width: `${task.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums min-w-[36px] text-right">
                                                {task.progress || 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- DESKTOP: table (≥ md) --- */}
                            <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Task
                                            </th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Assigned
                                            </th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Progress
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {tasks.map((task) => (
                                            <tr
                                                key={task._id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <td className="px-4 lg:px-6 py-3.5 max-w-[240px]">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate" title={task.title}>
                                                        {task.title}
                                                    </p>
                                                </td>
                                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap">
                                                    {task.assignedTo?.length > 0 ? (
                                                        <div className="flex -space-x-2">
                                                            {task.assignedTo.slice(0, 3).map((user) => (
                                                                <div
                                                                    key={user._id}
                                                                    className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] border-2 border-white dark:border-slate-900 overflow-hidden"
                                                                >
                                                                    {user.profilePic ? (
                                                                        <img
                                                                            src={user.profilePic}
                                                                            alt={user.fullName}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        user.fullName?.charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {task.assignedTo.length > 3 && (
                                                                <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[10px] font-medium border-2 border-white dark:border-slate-900 text-slate-700 dark:text-slate-200">
                                                                    +{task.assignedTo.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs rounded-full ${
                                                            task.status === 'Completed'
                                                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : task.status === 'In Progress'
                                                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs rounded-full ${
                                                            task.priority === 'High'
                                                                ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                                                : task.priority === 'Medium'
                                                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                                : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 lg:w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                            <div
                                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all"
                                                                style={{ width: `${task.progress || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                                                            {task.progress || 0}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Analytics;