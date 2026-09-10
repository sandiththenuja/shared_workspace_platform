// components/TaskCard.jsx - Complete Fixed Version

import React, { useState, useMemo, useEffect } from 'react';
import { 
    Pencil, Trash2, User, Check, X, 
    ChevronDown, ChevronUp, Clock, Calendar,
    Users, MoreHorizontal, Flag, Star,
    CheckCircle, Circle, AlertCircle, 
    MessageSquare, Paperclip, Link2,
    Eye, EyeOff, Zap, Sparkles, Loader2
} from 'lucide-react';
import TodoCheckLists from './TodoCheckLists';

const TaskCard = ({ 
    task, 
    isAdmin, 
    onEdit, 
    onDelete, 
    onProgressChange,
    updateTodoChecklist,
    teamMembers,
    currentUser
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [localProgress, setLocalProgress] = useState(task.progress || 0);
    const [localCompletedBy, setLocalCompletedBy] = useState(task.completedBy || []);

    // ============================================================
    // Calculate Progress from completedBy
    // ============================================================
    useEffect(() => {
        if (task.assignedTo && task.assignedTo.length > 0) {
            const completedCount = (task.completedBy || []).filter(memberId => 
                task.assignedTo.some(id => id?.toString() === memberId?.toString())
            ).length;
            const newProgress = Math.round((completedCount / task.assignedTo.length) * 100);
            setLocalProgress(newProgress);
        }
        setLocalCompletedBy(task.completedBy || []);
    }, [task.assignedTo, task.completedBy]);

    const progress = localProgress;
    const isComplete = progress === 100;

    // ============================================================
    // Check Permissions - ONLY assigned members can update
    // ============================================================
    const canEdit = useMemo(() => {
        // Admin can always edit
        if (isAdmin) return true;
        
        // Check if current user is assigned to this task
        return task.assignedTo?.some(id => 
            id?.toString() === currentUser?._id?.toString()
        );
    }, [task.assignedTo, currentUser, isAdmin]);

    const canMarkComplete = useMemo(() => {
        // Admin can always mark complete
        if (isAdmin) return true;
        
        // Only assigned members can mark complete
        return task.assignedTo?.some(id => 
            id?.toString() === currentUser?._id?.toString()
        );
    }, [task.assignedTo, currentUser, isAdmin]);

    // ============================================================
    // Handlers
    // ============================================================
    const handleMemberToggle = async (memberId) => {
        // ✅ Only allow if user is assigned or admin
        if (!canMarkComplete) {
            console.warn('User is not assigned to this task');
            return;
        }

        setIsUpdating(true);
        try {
            const isChecked = localCompletedBy?.includes(memberId);
            let newCompletedBy = [...(localCompletedBy || [])];
            
            if (isChecked) {
                newCompletedBy = newCompletedBy.filter(id => id !== memberId);
            } else {
                newCompletedBy.push(memberId);
            }
            
            // Calculate new progress
            const totalMembers = task.assignedTo?.length || 0;
            const completedCount = newCompletedBy.filter(id => 
                task.assignedTo?.some(assignedId => assignedId?.toString() === id?.toString())
            ).length;
            const newProgress = totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0;
            
            // Update local state
            setLocalCompletedBy(newCompletedBy);
            setLocalProgress(newProgress);
            
            // Call parent handler
            await onProgressChange(task._id, newProgress, newCompletedBy);
        } catch (error) {
            console.error('Error updating member progress:', error);
            // Revert local state on error
            setLocalCompletedBy(task.completedBy || []);
            setLocalProgress(task.progress || 0);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleTaskComplete = async () => {
        if (!canMarkComplete) return;
        
        setIsUpdating(true);
        try {
            const allMemberIds = task.assignedTo || [];
            const newProgress = allMemberIds.length > 0 ? 100 : 0;
            const newCompletedBy = allMemberIds.length > 0 ? allMemberIds : [];
            
            setLocalCompletedBy(newCompletedBy);
            setLocalProgress(newProgress);
            
            await onProgressChange(task._id, newProgress, newCompletedBy);
        } catch (error) {
            console.error('Error completing task:', error);
            setLocalCompletedBy(task.completedBy || []);
            setLocalProgress(task.progress || 0);
        } finally {
            setIsUpdating(false);
        }
    };

    // ============================================================
    // Helper Functions
    // ============================================================
    const getMemberName = (memberId) => {
        if (!memberId) return 'Unknown';
        const member = teamMembers.find(m => 
            (m._id || m)?.toString() === memberId?.toString()
        );
        return member?.fullName || member?.name || 'Unknown';
    };

    const getMemberAvatar = (memberId) => {
        if (!memberId) return null;
        const member = teamMembers.find(m => 
            (m._id || m)?.toString() === memberId?.toString()
        );
        return member?.profilePic || null;
    };

    const getMemberInitials = (memberId) => {
        const name = getMemberName(memberId);
        return name?.charAt(0)?.toUpperCase() || 'U';
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'High': return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
            case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
            case 'Low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10';
        }
    };

    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'High': return <Flag className="w-3.5 h-3.5" />;
            case 'Medium': return <Clock className="w-3.5 h-3.5" />;
            case 'Low': return <CheckCircle className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Completed': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
            case 'In Progress': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
            case 'Pending': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400';
            default: return 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Completed': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'In Progress': return <Zap className="w-3.5 h-3.5" />;
            case 'Pending': return <Circle className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    // components/TaskCard.jsx - Add todo checklist support

// Add this inside the TaskCard component
const handleTodoToggle = async (todoIndex) => {
    if (!onUpdateTodo) return;
    await onUpdateTodo(task._id, todoIndex);
};

// In the expanded section, add todo checklist rendering
{isExpanded && task.todoChecklist && task.todoChecklist.length > 0 && (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" />
            Todo Checklist
        </p>
        <div className="space-y-1.5">
            {task.todoChecklist.map((item, index) => (
                <div 
                    key={`todo-${index}`}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                    <button
                        onClick={() => handleTodoToggle(index)}
                        className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            item.completed 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                        }`}
                    >
                        {item.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${
                        item.completed 
                            ? 'text-slate-400 dark:text-slate-500 line-through' 
                            : 'text-slate-700 dark:text-slate-300'
                    }`}>
                        {item.text}
                    </span>
                    {item.completed && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                </div>
            ))}
        </div>
    </div>
)}

    // ============================================================
    // Render Assigned Members (Avatar Stack)
    // ============================================================
    const renderAssignedMembers = () => {
        if (!task.assignedTo || task.assignedTo.length === 0) {
            return (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>Unassigned</span>
                </div>
            );
        }

        const visibleMembers = task.assignedTo.slice(0, 3);
        const remainingCount = task.assignedTo.length - 3;

        return (
            <div className="flex items-center -space-x-1.5">
                {visibleMembers.map((memberId) => {
                    // ✅ Use memberId as key (string conversion)
                    const memberKey = memberId?.toString() || 'unknown';
                    const name = getMemberName(memberId);
                    const avatar = getMemberAvatar(memberId);
                    const isCompleted = localCompletedBy?.includes(memberId);
                    
                    return (
                        <div
                            key={memberKey}
                            className={`relative w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-medium ${
                                isCompleted 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                            }`}
                            title={`${name} ${isCompleted ? '✓' : ''}`}
                        >
                            {avatar ? (
                                <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                getMemberInitials(memberId)
                            )}
                            {isCompleted && (
                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white dark:border-slate-800 flex items-center justify-center">
                                    <Check className="w-1.5 h-1.5 text-white" />
                                </div>
                            )}
                        </div>
                    );
                })}
                {remainingCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        +{remainingCount}
                    </div>
                )}
            </div>
        );
    };

    // ============================================================
    // Render
    // ============================================================
    return (
        <div 
            className={`group relative p-4 rounded-xl transition-all duration-300 ${
                isHovered 
                    ? 'bg-slate-50 dark:bg-slate-800/50 shadow-sm' 
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            } ${isComplete ? 'border-l-4 border-emerald-500' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}

        >
            {/* ============================================================
                HEADER
                ============================================================ */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Title & Status Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex-1 text-left group/title"
                        >
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium transition-colors ${
                                    isComplete 
                                        ? 'text-slate-400 dark:text-slate-500 line-through' 
                                        : 'text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}>
                                    {task.title}
                                </span>
                                {isComplete && (
                                    <span className="flex-shrink-0 text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Done
                                    </span>
                                )}
                            </div>
                        </button>
                        
                        {/* Status Badge */}
                        <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full flex items-center gap-1 ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            {task.status}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full border flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                            {getPriorityIcon(task.priority)}
                            {task.priority}
                        </span>
                    </div>
                    
                    {/* Description Preview */}
                    {task.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Quick Complete Button - Only for assigned members */}
                    {!isComplete && canMarkComplete && (
                        <button
                            onClick={handleTaskComplete}
                            disabled={isUpdating}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            title="Mark all as complete"
                        >
                            {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                    )}
                    
                    {/* Edit Button - Only for assigned members or admin */}
                    {canEdit && (
                        <button
                            onClick={() => onEdit(task)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                            title="Edit task"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                    
                    {/* Delete Button - Admin only */}
                    {isAdmin && (
                        <button
                            onClick={() => onDelete(task._id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            title="Delete task"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* ============================================================
                METADATA
                ============================================================ */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
                {/* Assigned Members */}
                {renderAssignedMembers()}

                {/* Due Date */}
                {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                )}

                {/* Created By */}
                {task.createdBy && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        <span>{task.createdBy?.fullName || 'Unknown'}</span>
                    </div>
                )}
            </div>

            {/* ============================================================
                PROGRESS BAR
                ============================================================ */}
            <div className="mt-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[60px]">
                        Progress
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ease-out ${
                                isComplete 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 min-w-[36px] text-right tabular-nums">
                        {task.progress}%
                    </span>
                </div>
            </div>

            {/* ============================================================
                EXPANDED SECTION - Member Checkboxes
                ============================================================ */}
            {isExpanded && task.todoChecklist && task.todoChecklist.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-slideDown">
                    {/* Member Progress */}
                    <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            Members Progress
                        </p>
                        <div className="space-y-2">
                            {task.assignedTo.map((memberId) => {
                                // ✅ Use memberId as key (string conversion)
                                const memberKey = memberId?.toString() || 'unknown';
                                const name = getMemberName(memberId);
                                const avatar = getMemberAvatar(memberId);
                                const isCompleted = localCompletedBy?.includes(memberId);
                                const isCurrentUser = memberId?.toString() === currentUser?._id?.toString();
                                
                                // ✅ Only assigned members or admin can toggle
                                const canToggle = canMarkComplete && (isCurrentUser || isAdmin);

                                return (
                                    <div
                                        key={memberKey}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                                            isCompleted 
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10' 
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        {/* ✅ Checkbox for completion */}
                                        <div className="relative flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={isCompleted || false}
                                                onChange={() => handleMemberToggle(memberId)}
                                                disabled={!canToggle || isUpdating}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="relative flex-shrink-0">
                                            {avatar ? (
                                                <img 
                                                    src={avatar} 
                                                    alt={name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                                    isCompleted 
                                                        ? 'bg-emerald-500 text-white' 
                                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                                }`}>
                                                    {getMemberInitials(memberId)}
                                                </div>
                                            )}
                                            {isCompleted && (
                                                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${
                                                isCompleted 
                                                    ? 'text-slate-400 dark:text-slate-500 line-through' 
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {name}
                                                {isCurrentUser && (
                                                    <span className="text-xs text-indigo-500 ml-1 font-normal">(You)</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Status indicator */}
                                        <div className="flex items-center gap-1">
                                            {isCompleted ? (
                                                <span className="text-xs text-emerald-500 font-medium flex items-center gap-0.5">
                                                    <Check className="w-3 h-3" />
                                                    Done
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {task?.todoChecklist?.map((item, index) => (
                            <TodoCheckLists
                            key={`todo_${index}`}
                            text={item.text}
                            isChecked={item?.completed}
                            onChange={() => updateTodoChecklist(index)} />
                        ))}
                    </div>
                    
                    {/* Task Description */}
                    {task.description && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    )}
                    
                    {/* Due Date */}
                    {task.dueDate && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================
                EXPAND TOGGLE
                ============================================================ */}
            {task.assignedTo && task.assignedTo.length > 0 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Show details
                        </>
                    )}
                </button>
            )}

            {/* ============================================================
                PERMISSION INDICATOR
                ============================================================ */}
            {!canEdit && !isAdmin && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                    <Eye className="w-3 h-3" />
                    <span>View only</span>
                </div>
            )}
        </div>
    );
};

export default TaskCard;