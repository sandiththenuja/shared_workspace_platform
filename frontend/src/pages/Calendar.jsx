// pages/Calendar.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, Plus,
    Clock, AlertCircle,
    Calendar as CalendarIcon, Search,
    CheckCircle, Loader2, Trash2, X,
    ListTodo,
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState('month');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDayMobile, setSelectedDayMobile] = useState(null);
    const navigate = useNavigate()

    const { tasks, getTasks, updateTaskStatus, deleteTask, loading: taskLoading } = useTask();
    const { authUser } = useAuth();

    useEffect(() => {
        if (authUser) fetchTasks();
    }, [authUser]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedEvent) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [selectedEvent]);

    // Escape key closes modal
    useEffect(() => {
        if (!selectedEvent) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setSelectedEvent(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedEvent]);

    const fetchTasks = async () => {
        setIsLoading(true);
        await getTasks();
        setIsLoading(false);
    };

    // Convert tasks to calendar events
    const events = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];
        return tasks
            .filter((task) => task.dueDate)
            .map((task) => {
                const dueDate = new Date(task.dueDate);
                return {
                    id: task._id,
                    title: task.title,
                    description: task.description || '',
                    time: dueDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    date: dueDate.getDate(),
                    month: dueDate.getMonth(),
                    year: dueDate.getFullYear(),
                    fullDate: dueDate,
                    type: 'task',
                    color:
                        task.status === 'Completed'
                            ? 'emerald'
                            : task.status === 'In Progress'
                            ? 'blue'
                            : task.priority === 'High'
                            ? 'red'
                            : task.priority === 'Medium'
                            ? 'orange'
                            : 'indigo',
                    status: task.status,
                    priority: task.priority,
                    progress: task.progress || 0,
                    assignedTo: task.assignedTo || [],
                    createdBy: task.createdBy,
                };
            });
    }, [tasks]);

    // Filter
    const filteredEvents = useMemo(
        () =>
            events.filter((event) => {
                const s = searchTerm.toLowerCase();
                const matchesSearch =
                    event.title.toLowerCase().includes(s) ||
                    (event.description &&
                        event.description.toLowerCase().includes(s));
                const matchesFilter =
                    filterType === 'all' || event.status === filterType;
                return matchesSearch && matchesFilter;
            }),
        [events, searchTerm, filterType]
    );

    const getEventsForDate = (date) =>
        filteredEvents.filter(
            (event) =>
                event.date === date.getDate() &&
                event.month === date.getMonth() &&
                event.year === date.getFullYear()
        );

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
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Stable overdue check using full dates
    const isOverdue = (event) => {
        if (event.status === 'Completed') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDay = new Date(event.year, event.month, event.date);
        return eventDay < today;
    };

    const getColorClass = (color) => {
        const colors = {
            indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
            purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
            emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
            blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
            orange: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
            red: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
        };
        return colors[color] || colors.indigo;
    };

    const getColorBar = (color) => {
        const bars = {
            indigo: 'bg-indigo-500',
            purple: 'bg-purple-500',
            emerald: 'bg-emerald-500',
            blue: 'bg-blue-500',
            orange: 'bg-orange-500',
            red: 'bg-red-500',
        };
        return bars[color] || bars.indigo;
    };

    const getStatusBadge = (status) => {
        const badges = {
            Pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
            'In Progress': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
            Completed: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
        };
        return badges[status] || badges.Pending;
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            High: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
            Medium: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
            Low: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
        };
        return badges[priority] || badges.Medium;
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        await updateTaskStatus(taskId, newStatus);
        await fetchTasks();
        setSelectedEvent(null);
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(taskId);
            await fetchTasks();
            setSelectedEvent(null);
        }
    };

    const statusCounts = useMemo(() => {
        const counts = { all: events.length, pending: 0, inProgress: 0, completed: 0 };
        events.forEach((e) => {
            if (e.status === 'Pending') counts.pending++;
            else if (e.status === 'In Progress') counts.inProgress++;
            else if (e.status === 'Completed') counts.completed++;
        });
        return counts;
    }, [events]);

    const pendingEvents = useMemo(
        () =>
            filteredEvents
                .filter((e) => e.status !== 'Completed' && !isOverdue(e))
                .sort((a, b) => a.fullDate - b.fullDate)
                .slice(0, 5),
        [filteredEvents, isOverdue]
    );

    // Day detail drawer content (mobile)
    const mobileDayEvents = selectedDayMobile
        ? getEventsForDate(selectedDayMobile)
        : [];

    const handleClick = (id) => {
        setSelectedEvent(null)
        navigate(`/team/task/${id}`)
    }

    return (
        <>
            <div className="space-y-5 md:space-y-6 pb-8">
                {/* ===== HEADER ===== */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Calendar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your tasks and schedule
        </p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
        <button
            onClick={fetchTasks}
            className="p-2 sm:px-3.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            aria-label="Refresh"
        >
            <CalendarIcon className="w-4 h-4" />
            <span className="sm:inline">Refresh</span>
        </button>
        {/* <button className="px-2.5 py-2 sm:px-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-1.5 sm:gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Task</span>
            <span className="sm:hidden">Task</span>
        </button> */}
    </div>
</div>

                {/* ===== STATUS FILTERS (horizontal scroll on mobile) ===== */}
                <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
    <div className="flex gap-1.5 sm:gap-2 min-w-max pb-1 snap-x snap-mandatory">
                        <FilterPill
                            active={filterType === 'all'}
                            count={statusCounts.all}
                            label="All"
                            activeClass="bg-indigo-600 text-white"
                            idleClass="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            onClick={() => setFilterType('all')}
                        />
                        <FilterPill
                            active={filterType === 'Pending'}
                            count={statusCounts.pending}
                            label="Pending"
                            activeClass="bg-amber-600 text-white"
                            idleClass="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                            onClick={() => setFilterType('Pending')}
                        />
                        <FilterPill
                            active={filterType === 'In Progress'}
                            count={statusCounts.inProgress}
                            label="In Progress"
                            activeClass="bg-blue-600 text-white"
                            idleClass="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200"
                            onClick={() => setFilterType('In Progress')}
                        />
                        <FilterPill
                            active={filterType === 'Completed'}
                            count={statusCounts.completed}
                            label="Completed"
                            activeClass="bg-emerald-600 text-white"
                            idleClass="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                            onClick={() => setFilterType('Completed')}
                        />
                    </div>
                </div>

                {/* ===== CONTROLS BAR ===== */}
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
    {/* Row 1: navigation + Today */}
    <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 sm:gap-2 min-w-0 flex-1">
            <button
                onClick={() =>
                    setCurrentMonth(
                        new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() - 1,
                            1
                        )
                    )
                }
                aria-label="Previous month"
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h2 className="text-sm sm:text-lg font-semibold text-slate-800 dark:text-white truncate flex-1 text-center">
                {monthNames[currentMonth.getMonth()].slice(0, 3)}{' '}
                <span className="hidden xs:inline">
                    {monthNames[currentMonth.getMonth()].slice(3)}
                </span>{' '}
                {currentMonth.getFullYear()}
            </h2>
            <button
                onClick={() =>
                    setCurrentMonth(
                        new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() + 1,
                            1
                        )
                    )
                }
                aria-label="Next month"
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
            </button>
        </div>
        <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 font-medium text-slate-700 dark:text-slate-300"
        >
            Today
        </button>
    </div>

    {/* Row 2: search + view toggle */}
    <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 pointer-events-none" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
        <div className="shrink-0 flex bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
            {['month', 'week', 'day'].map((v) => (
                <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-label={`${v} view`}
                    className={`w-8 sm:w-auto sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors capitalize ${
                        view === v
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    <span className="hidden sm:inline capitalize">{v}</span>
                    <span className="sm:hidden">{v.charAt(0).toUpperCase()}</span>
                </button>
            ))}
        </div>
    </div>
</div>

                {/* ===== LOADING ===== */}
                {(isLoading || taskLoading) && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                )}

                {/* ===== CONTENT ===== */}
                {!isLoading && !taskLoading && (
                    <>
                        {/* ---------- MONTH VIEW ---------- */}
                        {view === 'month' && (
                            <>
                                {/* DESKTOP / TABLET: 7-col grid */}
                                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                                    <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-700/80">
                                        {dayNames.map((day) => (
                                            <div
                                                key={day}
                                                className="py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7">
                                        {days.map((day, index) => {
                                            const dayEvents = getEventsForDate(day.date);
                                            const isToday =
                                                day.date.toDateString() ===
                                                new Date().toDateString();
                                            const hasOverdue = dayEvents.some(isOverdue);

                                            return (
                                                <div
                                                    key={index}
                                                    className={`min-h-[110px] lg:min-h-[130px] p-2 border-r border-b border-slate-200/80 dark:border-slate-700/80 [&:nth-child(7n)]:border-r-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                        !day.isCurrentMonth
                                                            ? 'bg-slate-50/50 dark:bg-slate-800/30'
                                                            : ''
                                                    }`}
                                                    onClick={() => {
                                                        if (dayEvents.length > 0)
                                                            setSelectedEvent(dayEvents[0]);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span
                                                            className={`text-sm font-medium ${
                                                                isToday
                                                                    ? 'w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-full'
                                                                    : day.isCurrentMonth
                                                                    ? 'text-slate-700 dark:text-slate-300'
                                                                    : 'text-slate-400 dark:text-slate-600'
                                                            }`}
                                                        >
                                                            {day.date.getDate()}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {hasOverdue && (
                                                                <AlertCircle className="w-3 h-3 text-red-500" />
                                                            )}
                                                            {dayEvents.length > 0 && (
                                                                <span className="text-[10px] text-slate-400 font-medium">
                                                                    {dayEvents.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {dayEvents.slice(0, 2).map((event) => (
                                                            <div
                                                                key={event.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedEvent(event);
                                                                }}
                                                                className={`text-[11px] px-1.5 py-0.5 rounded ${getColorClass(
                                                                    event.color
                                                                )} truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                                                            >
                                                                {event.status === 'Completed' && (
                                                                    <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" />
                                                                )}
                                                                <span className="truncate">
                                                                    {event.title}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {dayEvents.length > 2 && (
                                                            <div className="text-[10px] text-slate-400 px-1.5">
                                                                +{dayEvents.length - 2} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* MOBILE: compact month + day drawer */}
                                <div className="md:hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                                    {/* Compact month header */}
                                    <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-700/80">
                                        {dayNames.map((d) => (
                                            <div
                                                key={d}
                                                className="py-2 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase"
                                            >
                                                {d.charAt(0)}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Compact day cells */}
<div className="grid grid-cols-7">
    {days.map((day, index) => {
        const dayEvents = getEventsForDate(day.date);
        const isToday =
            day.date.toDateString() === new Date().toDateString();
        const hasOverdue = dayEvents.some(isOverdue);
        const isSelected =
            selectedDayMobile &&
            day.date.toDateString() === selectedDayMobile.toDateString();
        const hasEvents = dayEvents.length > 0;

        return (
            <button
                key={index}
                onClick={() =>
                    setSelectedDayMobile(isSelected ? null : day.date)
                }
                className={`relative aspect-square flex flex-col items-center justify-center transition-colors border-b border-r border-slate-100 dark:border-slate-800 [&:nth-child(7n)]:border-r-0 ${
                    isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
            >
                <span
                    className={`text-xs sm:text-sm font-medium ${
                        isToday
                            ? 'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-indigo-600 text-white rounded-full'
                            : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                    {day.date.getDate()}
                </span>

                {/* Event dots */}
                {hasEvents && (
                    <div className="absolute bottom-1 sm:bottom-1.5 flex items-center gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                            <span
                                key={i}
                                className={`w-1 h-1 rounded-full ${getColorBar(
                                    event.color
                                )}`}
                            />
                        ))}
                    </div>
                )}

                {hasOverdue && (
                    <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full" />
                )}
            </button>
        );
    })}
</div>

                                    {/* Day drawer */}
                                    {selectedDayMobile && (
                                        <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    {selectedDayMobile.toLocaleDateString(
                                                        undefined,
                                                        {
                                                            weekday: 'long',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        }
                                                    )}
                                                </p>
                                                <button
                                                    onClick={() => setSelectedDayMobile(null)}
                                                    aria-label="Close"
                                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                                >
                                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                                </button>
                                            </div>

                                            {mobileDayEvents.length > 0 ? (
                                                <ul className="space-y-1.5 max-h-64 overflow-y-auto">
                                                    {mobileDayEvents.map((event) => (
                                                        <li key={event.id}>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedEvent(event);
                                                                    setSelectedDayMobile(null);
                                                                }}
                                                                className="w-full text-left flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            >
                                                                <span
                                                                    className={`w-1 h-8 rounded-full ${getColorBar(
                                                                        event.color
                                                                    )} shrink-0`}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-slate-800 dark:text-white truncate">
                                                                        {event.title}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                                        {event.time} · {event.status}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-slate-400 text-center py-3">
                                                    No events on this day
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ---------- WEEK VIEW ---------- */}
                        {view === 'week' && (
                            <WeekView
                                currentMonth={currentMonth}
                                filteredEvents={filteredEvents}
                                setSelectedEvent={setSelectedEvent}
                                getColorBar={getColorBar}
                                getColorClass={getColorClass}
                                isOverdue={isOverdue}
                            />
                        )}

                        {/* ---------- DAY VIEW ---------- */}
                        {view === 'day' && (
                            <DayView
                                selectedDate={selectedDayMobile || new Date()}
                                events={getEventsForDate(selectedDayMobile || new Date())}
                                setSelectedEvent={setSelectedEvent}
                                getColorBar={getColorBar}
                            />
                        )}

                        {/* ---------- UPCOMING TASKS ---------- */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    Upcoming Tasks
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                        ({pendingEvents.length})
                                    </span>
                                </h3>
                            </div>

                            {pendingEvents.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                    <p className="text-xs mt-1">No pending tasks available</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {pendingEvents.map((event) => (
                                        <button
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="w-full text-left flex items-center gap-3 sm:gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div
                                                className={`w-1 h-12 rounded-full shrink-0 ${getColorBar(
                                                    event.color
                                                )}`}
                                            />

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-slate-800 dark:text-white truncate">
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {event.time}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        <span className="hidden sm:inline">
                                                            {monthNames[event.month]}{' '}
                                                            {event.date}, {event.year}
                                                        </span>
                                                        <span className="sm:hidden">
                                                            {monthNames[event.month].slice(0, 3)}{' '}
                                                            {event.date}
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusBadge(
                                                            event.status
                                                        )}`}
                                                    >
                                                        {event.status}
                                                    </span>
                                                    {event.priority && (
                                                        <span
                                                            className={`hidden sm:inline px-2 py-0.5 text-[10px] font-medium rounded-full ${getPriorityBadge(
                                                                event.priority
                                                            )}`}
                                                        >
                                                            {event.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="hidden sm:block w-16 shrink-0">
                                                <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all"
                                                        style={{
                                                            width: `${event.progress || 0}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 text-center mt-1 tabular-nums">
                                                    {event.progress || 0}%
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ===== EVENT MODAL ===== */}
                {selectedEvent && (
                    <EventModal
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                        onStatusUpdate={handleStatusUpdate}
                        onDelete={handleDeleteTask}
                        getStatusBadge={getStatusBadge}
                        getPriorityBadge={getPriorityBadge}
                        monthNames={monthNames}
                        handleClick={handleClick}
                        isOverdue={isOverdue(selectedEvent)}
                    />
                )}
            </div>
        </>
    );
};

export default Calendar;

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

const FilterPill = ({ active, count, label, activeClass, idleClass, onClick }) => (
    <button
        onClick={onClick}
        className={`px-1.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors snap-start ${
            active ? activeClass : idleClass
        }`}
    >
        {label} ({count})
    </button>
);

const EventModal = ({
    event,
    onClose,
    onStatusUpdate,
    onDelete,
    getStatusBadge,
    getPriorityBadge,
    monthNames,
    handleClick,
    isOverdue
}) => {
    if (!event) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/50 dark:border-slate-700/50 my-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-700/80 px-5 py-4 flex items-start justify-between rounded-t-2xl z-10">
                    <div className="min-w-0 flex-1 pr-3">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-indigo-500 dark:text-indigo-400 mb-1">
                            Task
                        </p>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white break-words">
                            {event.title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {event.description && (
                        <div>
                            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                                Description
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>
                    )}
                    {isOverdue && (
                        <div className='flex gap-2 w-full bg-red-200 text-sm text-red-600 px-2 py-3 items-center rounded-lg'>
                            <AlertCircle />
                            <p>This task is overdue</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <InfoTile label="Status">
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadge(
                                    event.status
                                )}`}
                            >
                                {event.status}
                            </span>
                        </InfoTile>
                        <InfoTile label="Priority">
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityBadge(
                                    event.priority
                                )}`}
                            >
                                {event.priority || 'Medium'}
                            </span>
                        </InfoTile>
                        <InfoTile label="Due Date" full>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                                {monthNames[event.month]} {event.date}, {event.year}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {event.time}
                            </p>
                        </InfoTile>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
                                Progress
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                                {event.progress || 0}%
                            </span>
                        </div>
                        <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${event.progress || 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Assignees */}
                    {event.assignedTo?.length > 0 && (
                        <div>
                            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                Assigned To ({event.assignedTo.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {event.assignedTo.map((user, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg"
                                    >
                                        {user.fullName || user.name || 'User'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200/80 dark:border-slate-700/80 p-4 flex items-center gap-2">
                <button className='flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors' onClick={() => handleClick(event.id)}>View</button>
                    {/* {event.status !== 'Completed' ? (
                        <>
                            {event.status === 'Pending' && (
                                <button
                                    onClick={() =>
                                        onStatusUpdate(event.id, 'In Progress')
                                    }
                                    className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Start
                                </button>
                            )}
                            <button
                                onClick={() =>
                                    onStatusUpdate(event.id, 'Completed')
                                }
                                className="flex-1 px-3 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                            >
                                Complete
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onStatusUpdate(event.id, 'Pending')}
                            className="flex-1 px-3 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                        >
                            Reopen
                        </button>
                    )} */}
                    {/* <button
                        onClick={() => onDelete(event.id)}
                        aria-label="Delete task"
                        className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button> */}
                </div>
            </div>
        </div>
    );
};

const InfoTile = ({ label, children, full = false }) => (
    <div
        className={`p-3 bg-slate-50 dark:bg-slate-800 rounded-lg ${
            full ? 'col-span-2' : ''
        }`}
    >
        <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {label}
        </p>
        {children}
    </div>
);

/* ---------- WEEK VIEW ---------- */
const WeekView = ({
    currentMonth,
    filteredEvents,
    setSelectedEvent,
    getColorBar,
    getColorClass,
    isOverdue,
}) => {
    const [weekOffset, setWeekOffset] = useState(0);

    const startOfWeek = useMemo(() => {
        const d = new Date(currentMonth);
        d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [currentMonth, weekOffset]);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    const getEventsForDate = (date) =>
        filteredEvents.filter(
            (e) =>
                e.date === date.getDate() &&
                e.month === date.getMonth() &&
                e.year === date.getFullYear()
        );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-200/80 dark:border-slate-700/80">
                <button
                    onClick={() => setWeekOffset((o) => o - 1)}
                    aria-label="Previous week"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {startOfWeek.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                    })}{' '}
                    –{' '}
                    {weekDays[6].toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </span>
                <button
                    onClick={() => setWeekOffset((o) => o + 1)}
                    aria-label="Next week"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {weekDays.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const hasOverdue = dayEvents.some(isOverdue);

                    return (
                        <div key={day.toISOString()} className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className={`text-sm font-semibold ${
                                        isToday
                                            ? 'w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-full'
                                            : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {day.getDate()}
                                </span>
                                <span className="text-xs uppercase tracking-wide font-medium text-slate-500 dark:text-slate-400">
                                    {day.toLocaleDateString(undefined, {
                                        weekday: 'short',
                                    })}
                                </span>
                                {hasOverdue && (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 ml-auto" />
                                )}
                            </div>

                            {dayEvents.length > 0 ? (
                                <div className="space-y-1.5">
                                    {dayEvents.map((event) => (
                                        <button
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg ${getColorClass(
                                                event.color
                                            )} hover:opacity-80 transition-opacity`}
                                        >
                                            <span className="text-[11px] font-semibold shrink-0">
                                                {event.time}
                                            </span>
                                            <span className="text-xs truncate flex-1">
                                                {event.title}
                                            </span>
                                            {event.status === 'Completed' && (
                                                <CheckCircle className="w-3 h-3 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                    No events
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ---------- DAY VIEW ---------- */
const DayView = ({ selectedDate, events, setSelectedEvent, getColorBar }) => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
                    {isToday ? 'Today' : 'Selected day'}
                </p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white mt-0.5">
                    {selectedDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </p>
            </div>

            {events.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {events.map((event) => (
                        <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div
                                className={`w-1 h-12 rounded-full shrink-0 ${getColorBar(
                                    event.color
                                )}`}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-800 dark:text-white truncate">
                                    {event.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {event.time} · {event.status}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-4 text-slate-500 dark:text-slate-400">
                    <ListTodo className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">No events on this day</p>
                </div>
            )}
        </div>
    );
};