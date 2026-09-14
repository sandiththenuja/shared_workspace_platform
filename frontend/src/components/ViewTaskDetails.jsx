// pages/ViewTaskDetails.jsx
import axios from 'axios';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Flag,
    AlignLeft,
    ListChecks,
    Paperclip,
    Users,
    ExternalLink,
    CheckSquare,
    Square,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const ViewTaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {authUser} = useAuth()

    // ===== color helpers =====
    const getStatusTagColor = (status) => {
        switch (status) {
            case 'In Progress':
                return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-500/20';
            case 'Completed':
                return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20';
            default:
                return 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-500/20';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-500/20';
            case 'Medium':
                return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20';
            default:
                return 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700';
        }
    };

    // ===== data fetching =====
    const getTaskDetailsById = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`/api/tasks/${id}`);
            // if (response.data) setTask(response.data);
            if (response.data) {
            console.log('🔍 Full task response:', response.data);
            console.log('🔍 task.teamId:', response.data.teamId.createdBy._id);
            console.log('🔍 authUser._id:', authUser?._id);
            setTask(response.data);
        }
        } catch (err) {
            console.error('Error fetching task:', err);
            setError('Failed to load task details');
        } finally {
            setLoading(false);
        }
    };

    const updateTodoChecklist = async (index) => {
        const todoChecklist = [...(task?.todoChecklist || [])];
        if (!todoChecklist[index]) return;

        const wasCompleted = todoChecklist[index].completed;

        // optimistic toggle
        todoChecklist[index].completed = !wasCompleted;
        setTask((prev) => ({ ...prev, todoChecklist }));

        try {
            const response = await axios.put(`/api/tasks/${id}/todo`, {
                todoChecklist,
            });
            if (response.status === 200) {
                setTask(response.data?.task || task);
            } else {
                // revert on non-200
                todoChecklist[index].completed = wasCompleted;
                setTask((prev) => ({ ...prev, todoChecklist }));
            }
        } catch (err) {
            // revert on error
            todoChecklist[index].completed = wasCompleted;
            setTask((prev) => ({ ...prev, todoChecklist }));
        }
    };

    const isAdmin = useMemo(() => {
        if (!authUser?._id || !task) return false;

        const team = task.teamId;
        // console.log('Full task response:', response.data);
        // console.log('task.teamId:', response.data.teamId.createdBy._id);
        // console.log('authUser._id:', authUser?._id);

        if (team && typeof team === 'object' && team.createdBy) {
            const creatorId = team.createdBy._id;
            return creatorId?.toString() === authUser._id.toString();
        }

        return false;
    }, [task, authUser]);

    const handleLinkClick = (link) => {
        if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    useEffect(() => {
        if (id) getTaskDetailsById();
    }, [id]);

    // ===== derived =====
    const completedCount =
        task?.todoChecklist?.filter((i) => i.completed).length || 0;
    const totalCount = task?.todoChecklist?.length || 0;
    const progress =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // ===== loading =====
    if (loading) {
        return (
            <DashboardLayout activeTab="team">
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading task...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ===== error =====
    if (error || !task) {
        return (
            <DashboardLayout activeTab="team">
                <div className="flex flex-col items-center justify-center h-96 gap-3 px-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-slate-800 dark:text-white font-semibold">
                        {error || 'Task not found'}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Go back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="team">
            <div className="space-y-5 md:space-y-6 pb-8">
                {/* ===== BACK BUTTON ===== */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {/* ===== HERO HEADER CARD ===== */}
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] uppercase tracking-widest font-semibold text-indigo-500 dark:text-indigo-400 mb-2">
                                    Task Details
                                </p>
                                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white leading-tight break-words">
                                    {task.title}
                                </h1>

                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-[11px] md:text-xs font-medium px-2.5 py-1 rounded-full ${getStatusTagColor(
                                            task.status
                                        )}`}
                                    >
                                        {task.status}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-[11px] md:text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityColor(
                                            task.priority
                                        )}`}
                                    >
                                        <Flag className="w-3 h-3" />
                                        {task.priority}
                                    </span>
                                    {task.dueDate && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(
                                                task.dueDate
                                            ).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Progress ring on desktop, bar on mobile */}
                            {totalCount > 0 && (
                                <div className="shrink-0 self-start">
                                    <div className="hidden sm:block">
                                        <ProgressRing
                                            progress={progress}
                                            completed={completedCount}
                                            total={totalCount}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progress bar (mobile + tablet) */}
                        {totalCount > 0 && (
                            <div className="mt-4 sm:hidden">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        Progress
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                        {completedCount}/{totalCount} · {progress}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== CONTENT GRID ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                    {/* MAIN COLUMN */}
                    <div className="lg:col-span-2 space-y-5 md:space-y-6">
                        {/* Description */}
                        <Card>
                            <SectionLabel icon={AlignLeft} label="Description" />
                            <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-3">
                                {task.description || (
                                    <span className="text-slate-400 dark:text-slate-500 italic">
                                        No description provided
                                    </span>
                                )}
                            </p>
                        </Card>

                        {/* Subtasks */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <SectionLabel
                                    icon={ListChecks}
                                    label="Subtasks"
                                />
                                {totalCount > 0 && (
                                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                        {completedCount}/{totalCount} · {progress}%
                                    </span>
                                )}
                            </div>

                            {totalCount > 0 ? (
                                <ul className="space-y-2">
                                    {task.todoChecklist.map((item, index) => (
                                        <TodoCheckLists
                                            key={`todo_${index}`}
                                            text={item.text}
                                            isChecked={item?.completed}
                                            index={index}
                                            onChange={() =>
                                                updateTodoChecklist(index)
                                            }
                                            isAdmin={isAdmin}
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <EmptyRow
                                    icon={ListChecks}
                                    text="No subtasks for this task"
                                />
                            )}
                        </Card>

                        {/* Attachments */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <SectionLabel
                                    icon={Paperclip}
                                    label="Attachments"
                                />
                                {task.attachments?.length > 0 && (
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                        {task.attachments.length}
                                    </span>
                                )}
                            </div>

                            {task.attachments?.length > 0 ? (
                                <ul className="space-y-2">
                                    {task.attachments.map((link, index) => (
                                        <Attachment
                                            key={`link_${index}`}
                                            link={link}
                                            index={index}
                                            onClick={() =>
                                                handleLinkClick(link)
                                            }
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <EmptyRow
                                    icon={Paperclip}
                                    text="No attachments"
                                />
                            )}
                        </Card>
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1 space-y-5 md:space-y-6">
                        {/* Overview */}
                        <Card>
                            <SectionLabel icon={AlignLeft} label="Overview" />
                            <div className="mt-4 space-y-3">
                                <StatRow
                                    label="Status"
                                    value={task.status}
                                    valueClass={getStatusTagColor(task.status)}
                                />
                                <StatRow
                                    label="Priority"
                                    value={task.priority}
                                    valueClass={getPriorityColor(
                                        task.priority
                                    )}
                                />
                                <StatRow
                                    label="Due Date"
                                    value={
                                        task.dueDate
                                            ? new Date(
                                                  task.dueDate
                                              ).toLocaleDateString(undefined, {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                              })
                                            : 'Not set'
                                    }
                                />
                                <StatRow
                                    label="Subtasks"
                                    value={`${completedCount}/${totalCount}`}
                                />
                                <StatRow
                                    label="Attachments"
                                    value={task.attachments?.length || 0}
                                />
                            </div>
                        </Card>

                        {/* Assigned To */}
                        <Card>
                            <SectionLabel icon={Users} label="Assigned To" />
                            <div className="mt-3">
                                {task.assignedTo?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {task.assignedTo.map((user, i) => (
                                            <AssigneeRow
                                                key={user._id || i}
                                                user={user}
                                            />
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 dark:text-slate-500 py-2">
                                        Unassigned
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ViewTaskDetails;

/* ============================
   SUB-COMPONENTS
   ============================ */

const Card = ({ children }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-5 md:p-6">
        {children}
    </div>
);

const SectionLabel = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2">
        {Icon && (
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
        )}
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300">
            {label}
        </span>
    </div>
);

const StatRow = ({ label, value, valueClass }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">
            {label}
        </span>
        {valueClass ? (
            <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${valueClass}`}
            >
                {value}
            </span>
        ) : (
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {value}
            </span>
        )}
    </div>
);

const EmptyRow = ({ icon: Icon, text }) => (
    <div className="flex flex-col items-center justify-center gap-1.5 py-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        <p className="text-xs text-slate-500 dark:text-slate-400">{text}</p>
    </div>
);

const ProgressRing = ({ progress, completed, total }) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-slate-100 dark:text-slate-800"
                />
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
                <defs>
                    <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                    {progress}%
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {completed}/{total}
                </span>
            </div>
        </div>
    );
};

const AssigneeRow = ({ user }) => {
    const name = user?.fullName || user?.name || 'Unknown';
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {user?.profileImageUrl || user?.avatar ? (
                <img
                    src={user.profileImageUrl || user.avatar}
                    alt={name}
                    className="w-8 h-8 rounded-full object-cover"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-semibold">
                    {initials}
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">
                    {name}
                </p>
                {user?.email && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {user.email}
                    </p>
                )}
            </div>
        </li>
    );
};

const TodoCheckLists = ({ text, isChecked, onChange, index, isAdmin }) => {
    return (
        <li
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                isChecked
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-sm'
            }`}
        >
            <label className={`relative flex items-center gap-3 w-full ${isChecked ? `cursor-not-allowed` : `cursor-pointer`}`}>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={onChange}
                    disabled={isChecked}
                    className="sr-only peer"
                />

                {/* Index chip */}
                <span className="shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-mono font-semibold rounded text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                    {index < 9 ? `0${index + 1}` : index + 1}
                </span>

                {/* Custom checkbox */}
                <span
                    className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                        peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:scale-110
                        border-slate-300 dark:border-slate-600
                        peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2
                        dark:peer-focus-visible:ring-offset-slate-900"
                >
                    {isChecked ? (
                        <CheckSquare
                            className="w-3.5 h-3.5 text-white"
                            strokeWidth={3}
                        />
                    ) : (
                        <Square className="w-3.5 h-3.5 text-transparent" />
                    )}
                </span>

                <p
                    className={`text-[13px] leading-snug flex-1 transition-all duration-200 ${
                        isChecked
                            ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600'
                            : 'text-slate-800 dark:text-slate-200'
                    }`}
                >
                    {text}
                </p>
            </label>
        </li>
    );
};

const Attachment = ({ link, index, onClick }) => {
    const display =
        typeof link === 'string'
            ? link.replace(/^https?:\/\//i, '')
            : `Attachment ${index + 1}`;

    return (
        <li
            onClick={onClick}
            className="group flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50
                       border border-slate-200 dark:border-slate-700/60
                       hover:border-indigo-300 dark:hover:border-indigo-500/50
                       hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm
                       px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
        >
            <span
                className="shrink-0 w-6 h-6 flex items-center justify-center
                           text-[10px] font-semibold rounded-md
                           bg-white dark:bg-slate-900
                           text-slate-500 dark:text-slate-400
                           border border-slate-200 dark:border-slate-700"
            >
                {index < 9 ? `0${index + 1}` : index + 1}
            </span>

            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate">
                    {display.length > 50
                        ? display.slice(0, 50) + '...'
                        : display}
                </p>
            </div>

            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
        </li>
    );
};