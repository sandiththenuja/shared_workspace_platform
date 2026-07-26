// pages/Analytics.js
import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Users, Eye, 
    ArrowUp, ArrowDown, Download, Calendar,
    PieChart, BarChart, Activity, Zap,
    DollarSign, ShoppingBag, Clock, MessageSquare,
    CheckCircle, Clock as ClockIcon, AlertCircle,
    UserPlus, FileText, ListTodo
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useTask } from '../context/TaskContext';

const Analytics = () => {
    const { tasks, getTasks, statusSummary, getTaskStatistics } = useTask();
    const [loading, setLoading] = useState(true);
    const [chatStats, setChatStats] = useState({
        totalMessages: 0,
        unreadMessages: 0,
        activeConversations: 0,
        messagesPerDay: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await getTasks();
        // Simulate chat data (replace with actual API call)
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
                { day: 'Sun', count: 55 }
            ]
        });
        setLoading(false);
    };

    // Get task statistics
    const taskStats = getTaskStatistics(tasks);
    
    // Calculate completion rate
    const completionRate = taskStats.total > 0 
        ? Math.round((taskStats.completed / taskStats.total) * 100) 
        : 0;

    // Metrics data
    const metrics = [
        { 
            label: 'Total Tasks', 
            value: taskStats.total.toString(), 
            change: '+12.5%', 
            positive: true, 
            icon: ListTodo,
            color: 'indigo'
        },
        { 
            label: 'Completed Tasks', 
            value: taskStats.completed.toString(), 
            change: '+8.2%', 
            positive: true, 
            icon: CheckCircle,
            color: 'emerald'
        },
        { 
            label: 'Messages', 
            value: chatStats.totalMessages.toLocaleString(), 
            change: '+15.3%', 
            positive: true, 
            icon: MessageSquare,
            color: 'purple'
        },
        { 
            label: 'Pending Tasks', 
            value: taskStats.pending.toString(), 
            change: '-3.1%', 
            positive: false, 
            icon: ClockIcon,
            color: 'orange'
        },
    ];

    // Chart data for tasks by status
    const taskStatusData = [
        { label: 'Pending', value: taskStats.pending, color: '#f59e0b' },
        { label: 'In Progress', value: taskStats.inProgress, color: '#3b82f6' },
        { label: 'Completed', value: taskStats.completed, color: '#10b981' }
    ];

    const maxTaskValue = Math.max(...taskStatusData.map(d => d.value), 1);

    // Priority distribution data
    const priorityData = [
        { label: 'High', value: taskStats.priorityBreakdown?.high || 0, color: '#ef4444' },
        { label: 'Medium', value: taskStats.priorityBreakdown?.medium || 0, color: '#f59e0b' },
        { label: 'Low', value: taskStats.priorityBreakdown?.low || 0, color: '#3b82f6' }
    ];

    const maxPriorityValue = Math.max(...priorityData.map(d => d.value), 1);

    // Recent tasks
    const recentTasks = tasks.slice(0, 5);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            Analytics Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Track your tasks, messages, and team performance
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchData}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Last 7 days
                            <ArrowDown className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {metrics.map((metric, index) => {
                                const colorClasses = {
                                    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                                    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                                    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
                                    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                };
                                return (
                                    <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-2 rounded-lg ${colorClasses[metric.color]}`}>
                                                <metric.icon className="w-5 h-5" />
                                            </div>
                                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                                metric.positive ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                                {metric.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                                {metric.change}
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-3">{metric.value}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Task Status Distribution */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-800 dark:text-white">Task Status Distribution</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="text-emerald-500">●</span>
                                        <span>Completed: {taskStats.completed}</span>
                                        <span className="text-blue-500">●</span>
                                        <span>In Progress: {taskStats.inProgress}</span>
                                        <span className="text-amber-500">●</span>
                                        <span>Pending: {taskStats.pending}</span>
                                    </div>
                                </div>
                                <div className="h-64 flex items-end gap-3">
                                    {taskStatusData.map((data, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="relative w-full">
                                                <div 
                                                    className="w-full rounded-t transition-all hover:opacity-80"
                                                    style={{ 
                                                        height: `${(data.value / maxTaskValue) * 100}%`,
                                                        backgroundColor: data.color,
                                                        minHeight: data.value > 0 ? '20px' : '0px'
                                                    }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {data.value} tasks
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{data.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Priority Distribution */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Priority Distribution</h3>
                                <div className="space-y-4">
                                    {priorityData.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                                <span className="font-medium text-slate-800 dark:text-white">{item.value}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                <div 
                                                    className="h-2 rounded-full transition-all"
                                                    style={{ 
                                                        width: `${(item.value / maxPriorityValue) * 100}%`,
                                                        backgroundColor: item.color
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">Completion Rate</span>
                                        <span className="font-medium text-emerald-500">{completionRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-1">
                                        <div 
                                            className="bg-emerald-500 h-2 rounded-full transition-all"
                                            style={{ width: `${completionRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-800 dark:text-white">Message Activity</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                            <span>This week</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-48 flex items-end gap-3">
                                    {chatStats.messagesPerDay.map((data, index) => {
                                        const maxMsg = Math.max(...chatStats.messagesPerDay.map(d => d.count), 1);
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div 
                                                    className="w-full bg-purple-500 rounded-t transition-all hover:opacity-80"
                                                    style={{ 
                                                        height: `${(data.count / maxMsg) * 100}%`,
                                                        minHeight: data.count > 0 ? '10px' : '0px'
                                                    }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {data.count} messages
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{data.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Messages</p>
                                        <p className="text-xl font-bold text-slate-800 dark:text-white">
                                            {chatStats.totalMessages.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Unread</p>
                                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                            {chatStats.unreadMessages}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Active Conversations</p>
                                        <p className="text-xl font-bold text-slate-800 dark:text-white">
                                            {chatStats.activeConversations}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Task Overview</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                                <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">Total Tasks</span>
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-white">{taskStats.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                                                <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">Pending</span>
                                        </div>
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">{taskStats.pending}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">Completed</span>
                                        </div>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{taskStats.completed}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">Overdue</span>
                                        </div>
                                        <span className="font-semibold text-red-600 dark:text-red-400">{taskStats.overdue || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Tasks Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800 dark:text-white">Recent Tasks</h3>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Showing {recentTasks.length} of {taskStats.total} tasks
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {recentTasks.length > 0 ? (
                                            recentTasks.map((task) => (
                                                <tr key={task._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                                {task.title}
                                                            </p>
                                                            {task.description && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            task.status === 'Completed' 
                                                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : task.status === 'In Progress'
                                                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                        }`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            task.priority === 'High' 
                                                                ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                                                : task.priority === 'Medium'
                                                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                                : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        }`}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                                <div 
                                                                    className="bg-indigo-600 h-1.5 rounded-full"
                                                                    style={{ width: `${task.progress || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                {task.progress || 0}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                    No tasks found. Create your first task!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Analytics;