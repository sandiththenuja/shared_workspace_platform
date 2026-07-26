// pages/Calendar.js
import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Plus, 
    Clock, Users, MapPin, MoreVertical,
    Calendar as CalendarIcon, List, Grid,
    Filter, Search, CheckCircle, AlertCircle,
    Loader2, Edit2, Trash2, X
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    const { tasks, getTasks, updateTaskStatus, deleteTask, loading: taskLoading } = useTask();
    const { authUser } = useAuth();

    // Fetch tasks on mount
    useEffect(() => {
        if (authUser) {
            fetchTasks();
        }
    }, [authUser]);

    const fetchTasks = async () => {
        setIsLoading(true);
        await getTasks();
        setIsLoading(false);
    };

    // Convert tasks to calendar events
    const getCalendarEvents = () => {
        if (!tasks || tasks.length === 0) return [];

        return tasks
            .filter(task => task.dueDate)
            .map(task => {
                const dueDate = new Date(task.dueDate);
                return {
                    id: task._id,
                    title: task.title,
                    description: task.description || '',
                    time: dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: dueDate.getDate(),
                    month: dueDate.getMonth(),
                    year: dueDate.getFullYear(),
                    type: 'task',
                    color: task.status === 'Completed' ? 'emerald' :
                           task.status === 'In Progress' ? 'blue' :
                           task.priority === 'High' ? 'red' :
                           task.priority === 'Medium' ? 'orange' : 'indigo',
                    status: task.status,
                    priority: task.priority,
                    progress: task.progress || 0,
                    assignedTo: task.assignedTo || [],
                    createdBy: task.createdBy
                };
            });
    };

    const events = getCalendarEvents();

    // Filter events by search and type
    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterType === 'all' || event.status === filterType;
        return matchesSearch && matchesFilter;
    });

    // Get events for a specific date
    const getEventsForDate = (date) => {
        return filteredEvents.filter(event => 
            event.date === date.getDate() &&
            event.month === date.getMonth() &&
            event.year === date.getFullYear()
        );
    };

    // Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, isCurrentMonth: false });
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, isCurrentMonth: true });
        }
        
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, isCurrentMonth: false });
        }
        
        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getColorClass = (color) => {
        const colors = {
            indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
            purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
            emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
            blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
            orange: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
            red: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
        };
        return colors[color] || colors.indigo;
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Pending': 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
            'In Progress': 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
            'Completed': 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        };
        return badges[status] || badges['Pending'];
    };

    // Handle task status update
    const handleStatusUpdate = async (taskId, newStatus) => {
        await updateTaskStatus(taskId, newStatus);
        await fetchTasks();
    };

    // Handle task delete
    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(taskId);
            await fetchTasks();
            setSelectedEvent(null);
        }
    };

    // Get status counts
    const getStatusCounts = () => {
        const counts = { all: events.length, pending: 0, inProgress: 0, completed: 0 };
        events.forEach(event => {
            if (event.status === 'Pending') counts.pending++;
            else if (event.status === 'In Progress') counts.inProgress++;
            else if (event.status === 'Completed') counts.completed++;
        });
        return counts;
    };

    const statusCounts = getStatusCounts();

    // Event Modal
    const EventModal = ({ event, onClose }) => {
        if (!event) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Task Details
                        </h3>
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">{event.title}</h4>
                            {event.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                                <span className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-1 ${getStatusBadge(event.status)}`}>
                                    {event.status}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Priority</p>
                                <span className="text-sm font-medium text-slate-800 dark:text-white mt-1 block">
                                    {event.priority || 'Medium'}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Progress</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                        <div 
                                            className="bg-indigo-600 h-1.5 rounded-full"
                                            style={{ width: `${event.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                                        {event.progress || 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Due Date</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">
                                    {event.date} {monthNames[event.month]} {event.year}
                                </p>
                            </div>
                        </div>

                        {event.assignedTo && event.assignedTo.length > 0 && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Assigned To</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {event.assignedTo.map((user, idx) => (
                                        <span key={idx} className="text-sm bg-white dark:bg-slate-700 px-2 py-1 rounded-lg">
                                            {user.fullName || user.name || 'User'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            {event.status !== 'Completed' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(event.id, 'In Progress')}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Start Progress
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(event.id, 'Completed')}
                                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                                    >
                                        Complete
                                    </button>
                                </>
                            )}
                            {event.status === 'Completed' && (
                                <button
                                    onClick={() => handleStatusUpdate(event.id, 'Pending')}
                                    className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                                >
                                    Reopen
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteTask(event.id)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Calendar</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Manage your tasks and schedule
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchTasks}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <CalendarIcon className="w-4 h-4" />
                            Refresh
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Task
                        </button>
                    </div>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filterType === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        All ({statusCounts.all})
                    </button>
                    <button
                        onClick={() => setFilterType('Pending')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filterType === 'Pending'
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30'
                        }`}
                    >
                        Pending ({statusCounts.pending})
                    </button>
                    <button
                        onClick={() => setFilterType('In Progress')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filterType === 'In Progress'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30'
                        }`}
                    >
                        In Progress ({statusCounts.inProgress})
                    </button>
                    <button
                        onClick={() => setFilterType('Completed')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filterType === 'Completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                        }`}
                    >
                        Completed ({statusCounts.completed})
                    </button>
                </div>

                {/* Calendar Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white min-w-[150px] text-center">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h2>
                        <button 
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search events..."
                                className="w-full sm:w-40 pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                            <button 
                                onClick={() => setView('month')}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    view === 'month' 
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Month
                            </button>
                            <button 
                                onClick={() => setView('week')}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    view === 'week' 
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Week
                            </button>
                            <button 
                                onClick={() => setView('day')}
                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                    view === 'day' 
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Day
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {(isLoading || taskLoading) && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                )}

                {/* Calendar Grid */}
                {!isLoading && !taskLoading && (
                    <>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                            {/* Day Names */}
                            <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-700/80">
                                {dayNames.map((day) => (
                                    <div key={day} className="py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days */}
                            <div className="grid grid-cols-7">
                                {days.map((day, index) => {
                                    const dayEvents = getEventsForDate(day.date);
                                    const isToday = day.date.toDateString() === new Date().toDateString();
                                    const hasOverdueTasks = dayEvents.some(e => e.status !== 'Completed' && e.date < new Date().getDate());
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className={`min-h-[120px] p-2 border-r border-b border-slate-200/80 dark:border-slate-700/80 last:border-r-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                !day.isCurrentMonth ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                                            }`}
                                            onClick={() => {
                                                if (dayEvents.length > 0) {
                                                    setSelectedEvent(dayEvents[0]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-sm font-medium ${
                                                    isToday 
                                                        ? 'w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-full' 
                                                        : day.isCurrentMonth 
                                                            ? 'text-slate-700 dark:text-slate-300' 
                                                            : 'text-slate-400 dark:text-slate-600'
                                                }`}>
                                                    {day.date.getDate()}
                                                </span>
                                                {dayEvents.length > 0 && (
                                                    <span className="text-xs text-slate-400">{dayEvents.length}</span>
                                                )}
                                                {hasOverdueTasks && (
                                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map((event) => (
                                                    <div 
                                                        key={event.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(event);
                                                        }}
                                                        className={`text-xs px-2 py-1 rounded ${getColorClass(event.color)} truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                                                    >
                                                        {event.status === 'Completed' && (
                                                            <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                                        )}
                                                        <span className="font-medium">{event.time}</span>
                                                        <span className="truncate">{event.title}</span>
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-xs text-slate-400 px-2">
                                                        +{dayEvents.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Upcoming Tasks
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                        ({filteredEvents.filter(e => e.status !== 'Completed').length} pending)
                                    </span>
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {filteredEvents
                                    .filter(event => event.status !== 'Completed')
                                    .sort((a, b) => a.date - b.date)
                                    .slice(0, 5)
                                    .map((event) => (
                                        <div 
                                            key={event.id} 
                                            onClick={() => setSelectedEvent(event)}
                                            className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                        >
                                            <div className={`w-1 h-12 rounded-full ${
                                                event.color === 'indigo' ? 'bg-indigo-500' :
                                                event.color === 'purple' ? 'bg-purple-500' :
                                                event.color === 'emerald' ? 'bg-emerald-500' :
                                                event.color === 'blue' ? 'bg-blue-500' :
                                                event.color === 'red' ? 'bg-red-500' :
                                                'bg-orange-500'
                                            }`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 dark:text-white truncate">
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {event.time}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        {monthNames[event.month]} {event.date}, {event.year}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(event.status)}`}>
                                                        {event.status}
                                                    </span>
                                                    {event.priority && (
                                                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                            event.priority === 'High' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                                                            event.priority === 'Medium' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                                            'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        }`}>
                                                            {event.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-16">
                                                <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                    <div 
                                                        className="bg-indigo-600 h-1.5 rounded-full"
                                                        style={{ width: `${event.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-slate-400 text-center mt-1">
                                                    {event.progress || 0}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                {filteredEvents.filter(e => e.status !== 'Completed').length === 0 && (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        <p>No pending tasks</p>
                                        <p className="text-sm mt-1">All tasks are completed! 🎉</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Event Modal */}
                {selectedEvent && (
                    <EventModal 
                        event={selectedEvent} 
                        onClose={() => setSelectedEvent(null)} 
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default Calendar;