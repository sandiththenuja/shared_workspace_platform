// components/TaskCard.jsx - New Component

import React, { useState } from 'react';
import { Pencil, Trash2, User, Check, X } from 'lucide-react';

const TaskCard = ({ 
    task, 
    isAdmin, 
    onEdit, 
    onDelete, 
    onProgressChange,
    teamMembers,
    currentUser 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Calculate progress based on completed members
    const calculateProgress = () => {
        if (!task.assignedTo || task.assignedTo.length === 0) {
            return 0;
        }
        
        const completedCount = task.assignedTo.filter(memberId => 
            task.completedBy?.includes(memberId)
        ).length;
        
        return Math.round((completedCount / task.assignedTo.length) * 100);
    };
    
    const progress = task.progress || calculateProgress();
    const isComplete = progress === 100;
    
    // Handle member checkbox change
    const handleMemberToggle = async (memberId) => {
        const isChecked = task.completedBy?.includes(memberId);
        let newCompletedBy = [...(task.completedBy || [])];
        
        if (isChecked) {
            newCompletedBy = newCompletedBy.filter(id => id !== memberId);
        } else {
            newCompletedBy.push(memberId);
        }
        
        // Calculate new progress
        const totalMembers = task.assignedTo?.length || 0;
        const completedCount = newCompletedBy.length;
        const newProgress = totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0;
        
        // Update task
        await onProgressChange(task._id, newProgress, newCompletedBy);
    };
    
    // Check if current user is assigned to this task
    const isAssignedToMe = task.assignedTo?.some(id => 
        id.toString() === currentUser?._id?.toString()
    );
    
    // Check if current user has completed the task
    const isCompletedByMe = task.completedBy?.some(id => 
        id.toString() === currentUser?._id?.toString()
    );
    
    // Get member names for display
    const getMemberName = (memberId) => {
        const member = teamMembers.find(m => 
            (m._id || m).toString() === memberId.toString()
        );
        return member?.fullName || member?.name || 'Unknown';
    };
    
    return (
        <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Task Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 dark:text-white">
                            {task.title}
                        </p>
                        {isComplete && (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Done
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Assigned to: {task.assignedTo?.map(id => getMemberName(id)).join(', ') || 'Unassigned'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                        {task.status}
                    </span>
                    {isAdmin && (
                        <>
                            <button 
                                onClick={() => onEdit(task)} 
                                className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onDelete(task._id)} 
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-500 min-w-[60px]">Progress:</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-300 ${
                            isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 min-w-[40px] text-right">
                    {progress}%
                </span>
            </div>
            
            {/* Expanded Member Checkboxes */}
            {isExpanded && task.assignedTo?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Assigned Members:
                    </p>
                    <div className="space-y-2">
                        {task.assignedTo.map((member) => {
                            const memberName = getMemberName(member);
                            const isChecked = task.completedBy?.includes(member);
                            const isCurrentUser = member.toString() === currentUser?._id?.toString();
                            
                            return (
                                <label 
                                    key={member._id}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                        isChecked 
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked || false}
                                        onChange={() => handleMemberToggle(member)}
                                        disabled={!isAdmin && !isCurrentUser}
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                                            {memberName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <span className={`text-sm ${
                                            isChecked 
                                                ? 'text-slate-400 dark:text-slate-500 line-through' 
                                                : 'text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {memberName}
                                            {isCurrentUser && (
                                                <span className="text-xs text-indigo-500 ml-1">(You)</span>
                                            )}
                                        </span>
                                        {isChecked && (
                                            <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    
                    {/* Task Description */}
                    {task.description && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                {task.description}
                            </p>
                        </div>
                    )}
                    
                    {/* Due Date */}
                    {task.dueDate && (
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}
            
            {/* Expand/Collapse Hint */}
            {task.assignedTo?.length > 0 && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {isExpanded ? 'Show less' : `Show ${task.assignedTo.length} assigned member${task.assignedTo.length > 1 ? 's' : ''}`}
                </button>
            )}
        </div>
    );
};

export default TaskCard;