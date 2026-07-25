// pages/Calendar.js
import React, { useState } from 'react';
import {
    ChevronLeft, ChevronRight, Plus, 
    Clock, Users, MapPin, MoreVertical,
    Calendar as CalendarIcon, List, Grid,
    Filter, Search
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState('month');

    const events = [
        { id: 1, title: 'Design Review Meeting', time: '10:00 AM', date: 15, type: 'meeting', color: 'indigo' },
        { id: 2, title: 'Product Demo', time: '2:00 PM', date: 15, type: 'presentation', color: 'purple' },
        { id: 3, title: 'Team Lunch', time: '12:30 PM', date: 16, type: 'social', color: 'emerald' },
        { id: 4, title: 'Client Call', time: '3:30 PM', date: 17, type: 'call', color: 'blue' },
        { id: 5, title: 'Workshop', time: '9:00 AM', date: 18, type: 'workshop', color: 'orange' },
    ];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        // Previous month days
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, isCurrentMonth: false });
        }
        
        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, isCurrentMonth: true });
        }
        
        // Next month days
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

    const getEventsForDate = (date) => {
        return events.filter(event => event.date === date.getDate());
    };

    const getColorClass = (color) => {
        const colors = {
            indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
            purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
            emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
            blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
            orange: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
        };
        return colors[color] || colors.indigo;
    };

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Calendar</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your schedule and events
                    </p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Event
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

            {/* Calendar Grid */}
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
                        
                        return (
                            <div 
                                key={index} 
                                className={`min-h-[120px] p-2 border-r border-b border-slate-200/80 dark:border-slate-700/80 last:border-r-0 ${
                                    !day.isCurrentMonth ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                                }`}
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
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map((event) => (
                                        <div 
                                            key={event.id}
                                            className={`text-xs px-2 py-1 rounded ${getColorClass(event.color)} truncate`}
                                        >
                                            <span className="font-medium">{event.time}</span> {event.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-slate-400 px-2">
                                            +{dayEvents.length - 2} more
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
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                    {events.slice(0, 4).map((event) => (
                        <div key={event.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <div className={`w-1 h-12 rounded-full ${
                                event.color === 'indigo' ? 'bg-indigo-500' :
                                event.color === 'purple' ? 'bg-purple-500' :
                                event.color === 'emerald' ? 'bg-emerald-500' :
                                event.color === 'blue' ? 'bg-blue-500' :
                                'bg-orange-500'
                            }`}></div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-800 dark:text-white">{event.title}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {event.time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        {monthNames[currentMonth.getMonth()]} {event.date}
                                    </span>
                                </div>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default Calendar;