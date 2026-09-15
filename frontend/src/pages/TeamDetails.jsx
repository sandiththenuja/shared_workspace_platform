// pages/TeamDetails.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    ArrowLeft, UserPlus, Search, Users, Grid, List,
    UserX, Trash2, Loader2, Plus, Building2, AlertCircle,
    Shield, Eye, Copy, Upload, Camera, X, Link2, Check,
    Edit2, Save, File as FileIcon, ListTodo, Lock, Globe,
    Paperclip, ExternalLink, ArrowRight, CheckSquare,
    Square, Download, Image as ImageIcon, FileText, FileCode,
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

const TeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();

    // ===== state =====
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);
    const [view, setView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const [showEditTeamModal, setShowEditTeamModal] = useState(false);
    const [editTeamData, setEditTeamData] = useState({
        name: '', description: '', isPrivate: false, coverImg: null, coverPreview: null,
    });
    const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskForm, setTaskForm] = useState({
        title: '', description: '', priority: 'Medium', dueDate: '',
        teamId: teamId, assignedTo: [], todoChecklist: [], attachments: [],
    });

    // ===== context =====
    const { getTeamById, fetchTeams, addTeamMember, removeTeamMember, leaveTeam,
            deleteTeam, updateTeam, uploadTeamImage } = useTeam();
    const { authUser, token } = useAuth();
    const { tasks, getTasks } = useTask();
    const { socket } = useSocket(authUser?._id);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // ===== socket: online users =====
    useEffect(() => {
        if (!socket) return;
        const onOnline = (users) => setOnlineUsers(users || []);
        socket.on('getOnlineUsers', onOnline);
        return () => socket.off('getOnlineUsers', onOnline);
    }, [socket]);

    // ===== load team =====
    const loadTeam = async () => {
        if (!teamId) return;
        setLoading(true);
        setError(null);
        setViewOnlyMode(false);
        try {
            const data = await getTeamById(teamId);
            if (data) {
                setTeam(data);
                if (!checkIfUserIsMember(data)) setViewOnlyMode(true);
            } else {
                setError('Team not found');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setViewOnlyMode(true);
                setError('You are not a member of this team.');
            } else {
                setError('Failed to load team details.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTeam(); }, [teamId]);
    useEffect(() => { getTasks(); }, []);

    // ===== derived =====
    const teamTasks = useMemo(
        () => tasks.filter((t) => (t.teamId?._id || t.teamId)?.toString() === teamId),
        [tasks, teamId]
    );

    const getMemberId = (m) => (m?._id || m?.user?._id || m)?.toString();

    const checkIfUserIsMember = (t) => {
        if (!t || !authUser) return false;
        const uid = authUser._id.toString();
        if (t.createdBy) {
            const creatorId = (t.createdBy._id || t.createdBy).toString();
            if (creatorId === uid) return true;
        }
        return (t.members || []).some((m) => getMemberId(m) === uid);
    };

    const isTeamAdmin = () => {
        if (!team?.createdBy || !authUser) return false;
        const creatorId = (team.createdBy._id || team.createdBy).toString();
        return creatorId === authUser._id.toString();
    };

    const isUserMember = team ? checkIfUserIsMember(team) : false;

    const filteredMembers = useMemo(() => {
        const members = team?.members || [];
        if (!searchTerm) return members;
        const s = searchTerm.toLowerCase();
        return members.filter(
            (m) =>
                (m.fullName || m.name || '').toLowerCase().includes(s) ||
                (m.email || '').toLowerCase().includes(s)
        );
    }, [team?.members, searchTerm]);

    const getTeamInitials = (name) => {
        if (!name) return 'T';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    // ===== handlers: edit team =====
    const openEditModal = () => {
        if (!team) return;
        setEditTeamData({
            name: team.name || '',
            description: team.description || '',
            isPrivate: team.isPrivate || false,
            coverImg: team.coverImg || null,
            coverPreview: team.coverImg || null,
        });
        setShowEditTeamModal(true);
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const valid = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!valid.includes(file.type)) return toast.error('Invalid image type');
        if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
        const reader = new FileReader();
        reader.onload = (event) => {
            setEditTeamData((prev) => ({
                ...prev, coverImg: file, coverPreview: event.target.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const removeCoverImage = () => {
        setEditTeamData((prev) => ({ ...prev, coverImg: null, coverPreview: null }));
        if (coverInputRef.current) coverInputRef.current.value = '';
    };

    const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editTeamData.name.trim()) {
        return toast.error('Team name is required');
    }

    setIsUpdatingTeam(true);
    try {
        const updateData = {
            name: editTeamData.name.trim(),
            description: editTeamData.description.trim(),
            isPrivate: editTeamData.isPrivate,
        };

        // Cover image — three-way dispatch
        if (editTeamData.coverImg instanceof File) {
            // Case 1: user uploaded a new image
            const reader = new FileReader();
            const base64 = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(editTeamData.coverImg);
            });
            updateData.coverImg = base64;
        } else if (
            typeof editTeamData.coverImg === 'string' &&
            editTeamData.coverImg
        ) {
            // Case 2: existing base64/URL — user didn't touch it
            updateData.coverImg = editTeamData.coverImg;
        } else if (editTeamData.coverImg === null && team.coverImg) {
            // Case 3: user removed the existing cover
            updateData.coverImg = null;
        }
        // else: no cover ever, none added → skip coverImg entirely

        const result = await updateTeam(team._id, updateData);
        console.log(result);
        
        const ok = result?.success ?? result?.data?.success ?? true;
        if (ok) {
            setShowEditTeamModal(false);
            await loadTeam();
            await fetchTeams();
            toast.success('Team updated');
        } else {
            toast.error(result?.message || 'Failed to update team');
        }
    } catch (err) {
        console.error('Update team failed:');
    console.error('  status:', err.response?.status);
    console.error('  data:', err.response?.data);
    console.error('  message:', err.message);
    console.error('  full:', err);
        toast.error(err.response?.data?.message || 'Failed to update team');
    } finally {
        setIsUpdatingTeam(false);
    }
};
    const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || viewOnlyMode) return;

    // Validate
    const valid = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!valid.includes(file.type)) {
        e.target.value = '';   // clear the input so same file can be re-picked
        return toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
    }
    if (file.size > 5 * 1024 * 1024) {
        e.target.value = '';
        return toast.error('Image must be less than 5MB');
    }

    setIsUploadingImage(true);
    try {
        const fd = new FormData();
        fd.append('image', file);

        const result = await updateTeam(team._id, fd);

        // Tolerant success check
        const ok = result?.success ?? result?.data?.success ?? true;
        if (ok) {
            await loadTeam();
            toast.success('Team image updated');
        } else {
            toast.error(
                result?.message ||
                result?.data?.message ||
                'Failed to upload image'
            );
        }
    } catch (err) {
        console.error('Image upload failed:', err);
        toast.error(
            err.response?.data?.message ||
            err.message ||
            'Failed to upload image'
        );
    } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
};

    const handleLeaveTeam = async () => {
        if (!window.confirm(`Leave "${team.name}"?`)) return;
        const result = await leaveTeam(team._id);
        if (result) {
            toast.success('Left the team');
            await fetchTeams();
            navigate('/team');
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm(`Delete "${team.name}"? Cannot be undone.`)) return;
        const result = await deleteTeam(team._id);
        if (result) {
            toast.success('Team deleted');
            await fetchTeams();
            navigate('/team');
        }
    };

    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Remove ${memberName}?`)) return;
        const result = await removeTeamMember(team._id, memberId);
        if (result) {
            await loadTeam();
            toast.success('Member removed');
        }
    };

    // ===== add member modal =====
    const fetchAllUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data } = await axios.get('/api/auth/users');
            const list = Array.isArray(data) ? data : data.users || data.data || [];
            const existing = (team?.members || []).map((m) => getMemberId(m));
            setAllUsers(
                list.filter((u) => u && u._id !== authUser?._id && !existing.includes(u._id.toString()))
            );
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const openAddMemberModal = async () => {
        setShowAddMemberModal(true);
        setSelectedUsers([]);
        setUserSearchTerm('');
        await fetchAllUsers();
    };

    const filteredUsers = allUsers.filter((u) => {
        if (!userSearchTerm) return true;
        const s = userSearchTerm.toLowerCase();
        return u.fullName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
    });

    const toggleUserSelection = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleAddSelectedUsers = async () => {
        if (selectedUsers.length === 0) return;
        setIsLoading(true);
        let success = 0;
        for (const uid of selectedUsers) {
            const user = allUsers.find((u) => u._id === uid);
            if (!user) continue;
            try {
                const r = await addTeamMember(team._id, user.email);
                if (r) success++;
            } catch (_) {}
        }
        if (success > 0) {
            toast.success(`Added ${success} member${success > 1 ? 's' : ''}`);
            setShowAddMemberModal(false);
            await loadTeam();
        } else {
            toast.error('Failed to add members');
        }
        setIsLoading(false);
    };

    // ===== task modal =====
    const openCreateTaskModal = () => {
        setEditingTask(null);
        setTaskForm({
            title: '', description: '', priority: 'Low', dueDate: '',
            teamId, assignedTo: [], todoChecklist: [], attachments: [],
        });
        setIsTaskModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'Medium',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            teamId: task.teamId?._id || task.teamId || teamId,
            assignedTo: task.assignedTo?.map((u) => u._id) || [],
            todoChecklist: task.todoChecklist || [],
            attachments: task.attachments || [],
        });
        setIsTaskModalOpen(true);
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (!taskForm.title.trim()) return toast.error('Title required');
        const formattedTodoChecklist = (taskForm.todoChecklist || []).map((item) =>
            typeof item === 'string'
                ? { text: item, completed: false }
                : { text: item.text || '', completed: item.completed || false }
        );
        const taskData = {
            title: taskForm.title.trim(),
            description: taskForm.description?.trim() || '',
            priority: taskForm.priority || 'Medium',
            dueDate: taskForm.dueDate || null,
            teamId,
            assignedTo: taskForm.assignedTo || [],
            todoChecklist: formattedTodoChecklist,
            attachments: taskForm.attachments || [],
        };
        try {
            if (editingTask) {
                await axios.put(`/api/tasks/${editingTask._id}`, taskData);
                toast.success('Task updated');
            } else {
                await axios.post('/api/tasks', taskData);
                toast.success('Task created');
            }
            await getTasks();
            setIsTaskModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        await axios.delete(`/api/tasks/${taskId}`);
        await getTasks();
        toast.success('Task deleted');
    };

    const handleProgressChange = async (taskId, progress, completedBy) => {
        const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending';
        await axios.put(`/api/tasks/${taskId}/status`, { progress, status, completedBy });
        await getTasks();
    };

    const updateTodoChecklist = async (taskId, index) => {
        const task = teamTasks.find((t) => t._id === taskId);
        if (!task) return;
        const todoChecklist = [...(task.todoChecklist || [])];
        if (!todoChecklist[index] || todoChecklist[index].completed) return;
        todoChecklist[index] = { ...todoChecklist[index], completed: true };
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/tasks/${taskId}/todo`, { todoChecklist },
                { headers: { Authorization: `Bearer ${token}` } });
            await getTasks();
        } catch (err) {
            toast.error('Failed to update todo');
        }
    };

    const handleTaskClick = (taskId) => {
        navigate(`/team/${teamId}/task/${taskId}`);
    };

    // ===== loading / error =====
    if (loading) {
        return (
            <DashboardLayout activeTab="team">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !team) {
        return (
            <DashboardLayout activeTab="team">
                <div className="flex flex-col items-center justify-center h-96 gap-3 px-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-slate-800 dark:text-white font-semibold">
                        {error || 'Team not found'}
                    </p>
                    <button
                        onClick={() => navigate('/team')}
                        className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Back to Teams
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    // ===== main render =====
    return (
        <DashboardLayout activeTab="team">
            <div className="space-y-5 md:space-y-6 pb-8">
                <button
                    onClick={() => navigate('/team')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Teams
                </button>

                {viewOnlyMode && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                        <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-amber-700 dark:text-amber-300 text-sm">
                            You're viewing this team as a guest. Some actions may be limited.
                        </p>
                    </div>
                )}

                {/* Team Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                    <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                        {(team.coverImg || team.image) && (
                            <img
                                src={team.coverImg || team.image}
                                alt={team.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {!viewOnlyMode && isTeamAdmin() && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="team-cover-upload"
                                    onChange={handleImageUpload}
                                />
                                <label
                                    htmlFor="team-cover-upload"
                                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 cursor-pointer backdrop-blur-sm"
                                >
                                    {isUploadingImage ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4" />
                                    )}
                                </label>
                            </>
                        )}
                    </div>

                    <div className="px-4 sm:px-6 pb-5 -mt-10 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div className="flex items-end gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white dark:border-slate-900 shadow-md overflow-hidden shrink-0">
                                    {team.coverImg || team.image ? (
                                        <img
                                            src={team.coverImg || team.image}
                                            alt={team.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        getTeamInitials(team.name)
                                    )}
                                </div>
                                <div className="p-1 mt-10">
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 flex-wrap">
                                        {team.name}
                                        {isTeamAdmin() && (
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                                <Shield className="w-3 h-3" />
                                                Admin
                                            </span>
                                        )}
                                        {team.isPrivate && (
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                                <Lock className="w-3 h-3" />
                                                Private
                                            </span>
                                        )}
                                    </h1>
                                    {team.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                                            {team.description}
                                        </p>
                                    )}
                                    {!isTeamAdmin() && (
                                        <p className='text-sm text-slate-700 dark:text-slate-300 mt-1'>Admin: {team.createdBy.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {!viewOnlyMode && isTeamAdmin() && (
                                    <>
                                        <button
                                            onClick={openEditModal}
                                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={openAddMemberModal}
                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-1"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Add Members
                                        </button>
                                        <button
                                            onClick={handleDeleteTeam}
                                            className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {!viewOnlyMode && !isTeamAdmin() && isUserMember && (
                                    <button
                                        onClick={handleLeaveTeam}
                                        className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center gap-1"
                                    >
                                        <UserX className="w-4 h-4" />
                                        Leave
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <ListTodo className="w-4 h-4" />
                                {teamTasks.length} task{teamTasks.length !== 1 ? 's' : ''}
                            </span>
                            {team.inviteCode && isTeamAdmin() && (
                                <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                    Code: {team.inviteCode}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    TEAM MEMBERS
                   ============================================================ */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team Members
                            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                ({filteredMembers.length})
                            </span>
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search members..."
                                    className="w-48 pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {!viewOnlyMode && isTeamAdmin() && (
                                <button
                                    onClick={openAddMemberModal}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredMembers.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <p>No members found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {filteredMembers.map((member) => {
                                const memberId = getMemberId(member);
                                const memberName = member.fullName || member.name || 'Unknown';
                                const memberEmail = member.email || '';
                                const memberAvatar = member.avatar || member.profilePic || null;
                                const isOnline = onlineUsers.includes(memberId);
                                const isCurrentUser = memberId === authUser?._id?.toString();

                                return (
                                    <div key={memberId} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {memberAvatar ? (
                                                        <img src={memberAvatar} alt={memberName} className="w-12 h-12 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                            {memberName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${isOnline ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white text-sm flex items-center gap-1">
                                                        {memberName}
                                                        {isCurrentUser && <span className="text-xs text-indigo-500">(You)</span>}
                                                    </p>
                                                    {memberEmail && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{memberEmail}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {!viewOnlyMode && isTeamAdmin() && !isCurrentUser && (
                                                <button
                                                    onClick={() => handleRemoveMember(memberId, memberName)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    title="Remove member"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ============================================================
                    TEAM TASKS
                   ============================================================ */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <ListTodo className="w-5 h-5 text-indigo-500" />
                            Team Tasks ({teamTasks.length})
                        </h3>
                        {isTeamAdmin() && (
                            <button
                                onClick={openCreateTaskModal}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Task
                            </button>
                        )}
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {teamTasks.length > 0 ? (
                            teamTasks.map((task) => (
                                <InlineTaskCard
                                    key={task._id}
                                    task={task}
                                    isAdmin={!viewOnlyMode && isTeamAdmin()}
                                    onEdit={openEditTaskModal}
                                    onDelete={handleDeleteTask}
                                    onProgressChange={handleProgressChange}
                                    updateTodoChecklist={updateTodoChecklist}
                                    teamMembers={team?.members || []}
                                    currentUser={authUser}
                                    onSelect={() => handleTaskClick(task._id)}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <ListTodo className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No tasks for this team yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================================
                    TEAM FILES
                   ============================================================ */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileIcon className="w-5 h-5" />
                            Team Files
                        </h3>
                        {!viewOnlyMode && isTeamAdmin() && (
                            <InlineTeamFiles
                                teamId={team._id}
                                onFileUploaded={(updated) => {
                                    if (updated) setTeam(updated);
                                }}
                            />
                        )}
                    </div>
                    <div className="p-4">
                        <InlineTeamFileList
                            files={team.files || []}
                            teamId={team._id}
                            onFileDeleted={(fileId) => {
                                setTeam((prev) => ({
                                    ...prev,
                                    files: (prev.files || []).filter((f) => (f._id || f.id) !== fileId),
                                }));
                            }}
                            isAdmin={isTeamAdmin()}
                        />
                    </div>
                </div>
            </div>

            {/* ============================================================
                MODALS
               ============================================================ */}
            {showAddMemberModal && (
                <AddMembersModal
                    teamName={team.name}
                    users={filteredUsers}
                    loading={loadingUsers}
                    searchTerm={userSearchTerm}
                    setSearchTerm={setUserSearchTerm}
                    selectedUsers={selectedUsers}
                    toggleUser={toggleUserSelection}
                    onSelectAll={() => setSelectedUsers(filteredUsers.map((u) => u._id))}
                    onClearAll={() => setSelectedUsers([])}
                    onAdd={handleAddSelectedUsers}
                    adding={isLoading}
                    onClose={() => { setShowAddMemberModal(false); setSelectedUsers([]); }}
                />
            )}

            {showEditTeamModal && (
                <EditTeamModal
                    data={editTeamData}
                    setData={setEditTeamData}
                    onCoverChange={handleCoverImageChange}
                    onCoverRemove={removeCoverImage}
                    coverInputRef={coverInputRef}
                    onSubmit={handleUpdateTeam}
                    onClose={() => setShowEditTeamModal(false)}
                    updating={isUpdatingTeam}
                />
            )}

            {isTaskModalOpen && (
                <TaskModal
                    editingTask={editingTask}
                    form={taskForm}
                    setForm={setTaskForm}
                    teamMembers={team?.members || []}
                    onSubmit={handleTaskSubmit}
                    onClose={() => setIsTaskModalOpen(false)}
                />
            )}
        </DashboardLayout>
    );
};

export default TeamDetails;

/* ============================================================
   INLINE: Team Files (upload button + list)
   ============================================================ */

const InlineTeamFiles = ({ teamId, onFileUploaded }) => {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const handleChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await axios.post(`/api/teams/${teamId}/files`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.success) {
                toast.success('File uploaded');
                onFileUploaded?.(data.team);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <>
            <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1 disabled:opacity-50"
            >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
            </button>
        </>
    );
};

const InlineTeamFileList = ({ files = [], teamId, onFileDeleted, isAdmin }) => {
    const getIcon = (file) => {
        const ext = (file.name || '').split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return <ImageIcon className="w-5 h-5 text-purple-500" />;
        if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
        if (['doc', 'docx'].includes(ext)) return <FileText className="w-5 h-5 text-blue-500" />;
        if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileText className="w-5 h-5 text-emerald-500" />;
        if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(ext)) return <FileCode className="w-5 h-5 text-indigo-500" />;
        return <FileIcon className="w-5 h-5 text-slate-400" />;
    };

    const handleDelete = async (file) => {
        if (!window.confirm(`Delete "${file.name}"?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/teams/${teamId}/files/${file._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('File deleted');
            onFileDeleted?.(file._id);
        } catch (err) {
            toast.error('Failed to delete file');
        }
    };

    const handleDownload = (file) => {
        if (file.url) window.open(file.url, '_blank', 'noopener,noreferrer');
        else toast.error('No download URL');
    };

    if (!files || files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <FileIcon className="w-6 h-6 text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No files uploaded yet</p>
            </div>
        );
    }

    return (
        <ul className="space-y-2">
            {files.map((file) => (
                <li
                    key={file._id || file.id}
                    className="group flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                >
                    <div className="shrink-0">{getIcon(file)}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {file.name || 'Untitled'}
                        </p>
                        {file.size != null && (
                            <p className="text-xs text-slate-400">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => handleDownload(file)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Download"
                        >
                            <Download className="w-4 h-4 text-slate-400 hover:text-indigo-500" />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => handleDelete(file)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

/* ============================================================
   INLINE: TaskCard
   ============================================================ */

const InlineTaskCard = ({
    task, isAdmin, onEdit, onDelete, onProgressChange,
    updateTodoChecklist, teamMembers, currentUser, onSelect,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localCompletedBy, setLocalCompletedBy] = useState(task.completedBy || []);

    useEffect(() => {
        setLocalCompletedBy(task.completedBy || []);
    }, [task.completedBy]);

    const completedCount =
        task?.todoChecklist?.filter((i) => i.completed).length || 0;
    const totalCount = task?.todoChecklist?.length || 0;
    const progress =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const isComplete = progress === 100;

    const getMemberId = (m) => (m?._id || m)?.toString();

    const getMemberName = (id) => {
        const m = teamMembers.find((x) => getMemberId(x) === id?.toString());
        return m?.fullName || m?.name || 'Unknown';
    };

    const getMemberAvatar = (id) => {
        const m = teamMembers.find((x) => getMemberId(x) === id?.toString());
        return m?.profilePic || m?.avatar || null;
    };

    // const canEdit = isAdmin || task.assignedTo?.some((id) =>
    //     (id._id || id).toString() === currentUser?._id?.toString()
    // );

    const canEdit = isAdmin

    const handleMemberToggle = async (e, memberId) => {
        e.stopPropagation();
        if (!canEdit) return;
        const isChecked = localCompletedBy.some((id) => id.toString() === memberId.toString());
        const next = isChecked
            ? localCompletedBy.filter((id) => id.toString() !== memberId.toString())
            : [...localCompletedBy, memberId];
        setLocalCompletedBy(next);
        const total = task.assignedTo?.length || 0;
        const done = next.filter((id) =>
            task.assignedTo.some((a) => (a._id || a).toString() === id.toString())
        ).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        await onProgressChange?.(task._id, pct, next);
    };

    const toggleTodo = async (e, index) => {
        e.stopPropagation();
        if (updateTodoChecklist) await updateTodoChecklist(task._id, index);
    };

    const priorityClass = {
        High: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
        Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
        Low: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    }[task.priority] || 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';

    const statusClass = {
        Completed: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
        'In Progress': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
        Pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    }[task.status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

    return (
        <div
            onClick={onSelect}
            className={`group p-4 rounded-xl cursor-pointer transition-all`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className="text-left"
                        >
                            <span className={`text-sm font-medium text-slate-800 dark:text-white`}>
                                {task.title}
                            </span>
                        </button>
                        <span className={`shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${statusClass}`}>
                            {task.status}
                        </span>
                        <span className={`shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full border ${priorityClass}`}>
                            {task.priority}
                        </span>
                    </div>
                    {task.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {task.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {canEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(task._id); }}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
                {task.assignedTo?.length > 0 ? (
                    <div className="flex items-center -space-x-1.5">
                        {task.assignedTo.slice(0, 4).map((member) => {
                            const id = (member._id || member).toString();
                            const name = getMemberName(id);
                            const avatar = getMemberAvatar(id);
                            const done = localCompletedBy.some((c) => c.toString() === id);
                            return (
                                <button
                                    key={id}
                                    onClick={(e) => handleMemberToggle(e, member._id || member)}
                                    className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-medium ${
                                        done ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                    }`}
                                    title={`${name}${done ? ' ✓' : ''}`}
                                >
                                    {avatar ? (
                                        <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    )}
                                </button>
                            );
                        })}
                        {task.assignedTo.length > 4 && (
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px]">
                                +{task.assignedTo.length - 4}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-xs text-slate-400">Unassigned</span>
                )}

                {task.dueDate && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${
                            isComplete
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                    {progress}%
                </span>
            </div>

            {/* Expanded: todo checklist */}
            {isExpanded && task.todoChecklist?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    {task.todoChecklist.map((item, index) => (
                        <button
                            key={index}
                            onClick={(e) => toggleTodo(e, index)}
                            disabled={item.completed}
                            className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left ${
                                item.completed ? 'cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <span className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                                item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                                {item.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </span>
                            <span className={`text-xs flex-1 ${
                                item.completed
                                    ? 'text-slate-400 dark:text-slate-500 line-through'
                                    : 'text-slate-700 dark:text-slate-300'
                            }`}>
                                {item.text}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ============================================================
   INLINE: Assign Members Field
   ============================================================ */

const AssignMembersField = ({ members = [], value = [], onChange }) => {
    const [search, setSearch] = useState('');
    const getId = (m) => (m._id || m).toString();

    const filtered = useMemo(() => {
        if (!search) return members;
        const s = search.toLowerCase();
        return members.filter(
            (m) =>
                (m.fullName || m.name || '').toLowerCase().includes(s) ||
                (m.email || '').toLowerCase().includes(s)
        );
    }, [members, search]);

    const toggle = (m) => {
        const id = getId(m);
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Assign Members
                </label>
                <span className="text-xs text-slate-400">
                    {value.length} of {members.length} selected
                </span>
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    {value.map((id) => {
                        const member = members.find((m) => getId(m) === id);
                        const name = member?.fullName || member?.name || 'Unknown';
                        const avatar = member?.profilePic || member?.avatar || null;
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                            >
                                {avatar ? (
                                    <img src={avatar} alt={name} className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-semibold text-white">
                                        {name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <span className="truncate max-w-[110px]">{name}</span>
                                <button
                                    type="button"
                                    onClick={() => toggle(member || { _id: id })}
                                    className="ml-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5"
                                >
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {members.length > 5 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search members..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 -mr-1">
                {filtered.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm">
                            {search ? 'No members match your search' : 'No team members yet'}
                        </p>
                    </div>
                ) : (
                    filtered.map((member) => {
                        const id = getId(member);
                        const selected = value.includes(id);
                        const name = member.fullName || member.name || 'Unknown';
                        const email = member.email || '';
                        const avatar = member.profilePic || member.avatar || null;
                        return (
                            <div
                                key={id}
                                onClick={() => toggle(member)}
                                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border-2 ${
                                    selected
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500'
                                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-transparent'
                                }`}
                            >
                                <div className="relative shrink-0">
                                    {avatar ? (
                                        <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {selected && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{name}</p>
                                    {email && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

/* ============================================================
   INLINE: TodoListInput
   ============================================================ */

const TodoListInput = ({ todoList = [], setTodoList }) => {
    const [option, setOption] = useState('');

    const add = () => {
        if (option.trim()) {
            setTodoList([...todoList, { text: option.trim(), completed: false }]);
            setOption('');
        }
    };

    const remove = (i) => setTodoList(todoList.filter((_, idx) => idx !== i));

    const onKey = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); add(); }
    };

    return (
        <div className="w-full">
            {todoList.length > 0 ? (
                <ul className="space-y-2 mb-2">
                    {todoList.map((item, i) => {
                        const text = typeof item === 'string' ? item : item?.text || '';
                        return (
                            <li key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-lg px-3 py-2">
                                <span className="shrink-0 w-6 h-6 flex items-center justify-center text-[10px] font-semibold rounded-md bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {i < 9 ? `0${i + 1}` : i + 1}
                                </span>
                                <p className="flex-1 min-w-0 text-[13px] text-slate-700 dark:text-slate-200 truncate">
                                    {text}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 py-4 mb-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                    <ListTodo className="w-5 h-5 text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">No subtasks yet</p>
                </div>
            )}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Add a subtask..."
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                    onKeyDown={onKey}
                    className="flex-1 px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="button"
                    onClick={add}
                    disabled={!option.trim()}
                    className="shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>
        </div>
    );
};

/* ============================================================
   INLINE: AddAttachmentsInput
   ============================================================ */

const AddAttachmentsInput = ({ attachments = [], setAttachments }) => {
    const [input, setInput] = useState('');

    const add = () => {
        const url = input.trim();
        if (!url) return;
        setAttachments([...(attachments || []), url]);
        setInput('');
    };

    const remove = (i) => setAttachments((attachments || []).filter((_, idx) => idx !== i));

    const onKey = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); add(); }
    };

    return (
        <div className="w-full">
            {attachments?.length > 0 && (
                <ul className="space-y-1.5 mb-2">
                    {attachments.map((link, i) => (
                        <li
                            key={i}
                            className="group flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 px-3 py-2 rounded-lg"
                        >
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-semibold rounded bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700">
                                {i + 1}
                            </span>
                            <p className="flex-1 min-w-0 text-xs text-slate-700 dark:text-slate-200 truncate">
                                {typeof link === 'string' ? link.replace(/^https?:\/\//i, '') : `Attachment ${i + 1}`}
                            </p>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                className="shrink-0 p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Paste a link or URL..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKey}
                    className="flex-1 px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="button"
                    onClick={add}
                    disabled={!input.trim()}
                    className="shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>
        </div>
    );
};

/* ============================================================
   INLINE: Add Members Modal
   ============================================================ */

const AddMembersModal = ({
    teamName, users, loading, searchTerm, setSearchTerm,
    selectedUsers, toggleUser, onSelectAll, onClearAll,
    onAdd, adding, onClose,
}) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add Team Members</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select users to add to "{teamName}"</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {users.length > 0 && (
                    <div className="flex items-center gap-3 mb-4 text-sm">
                        <button onClick={onSelectAll} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                            Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button onClick={onClearAll} className="text-slate-500 hover:underline">
                            Deselect All
                        </button>
                    </div>
                )}

                {selectedUsers.length > 0 && (
                    <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-indigo-600 dark:text-indigo-400">
                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                        </span>
                        <button onClick={onClearAll} className="text-sm text-red-500 hover:text-red-700">
                            Clear
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No users available to add</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {users.map((user) => {
                            const selected = selectedUsers.includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    onClick={() => toggleUser(user._id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                                        selected
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500'
                                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-transparent'
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        {selected && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{user.fullName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="border-t border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium">
                    Cancel
                </button>
                <button
                    onClick={onAdd}
                    disabled={selectedUsers.length === 0 || adding}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Add {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                </button>
            </div>
        </div>
    </div>
);

/* ============================================================
   INLINE: Edit Team Modal
   ============================================================ */

const EditTeamModal = ({
    data, setData, onCoverChange, onCoverRemove, coverInputRef,
    onSubmit, onClose, updating,
}) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Team</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Update team details</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cover Image</label>
                    {data.coverPreview ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                            <img src={data.coverPreview} alt="Cover" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={onCoverRemove}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all">
                            <Camera className="w-8 h-8 text-slate-400" />
                            <span className="text-sm text-slate-500 mt-2">Upload Cover</span>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onCoverChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Team Name *</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                        maxLength={50}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white resize-none"
                        maxLength={500}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Privacy</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setData((p) => ({ ...p, isPrivate: true }))}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                data.isPrivate ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            <Lock className="w-5 h-5" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-800 dark:text-white">Private</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setData((p) => ({ ...p, isPrivate: false }))}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                !data.isPrivate ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            <Globe className="w-5 h-5" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-800 dark:text-white">Public</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={updating || !data.name.trim()}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update
                    </button>
                </div>
            </form>
        </div>
    </div>
);

/* ============================================================
   INLINE: Task Modal
   ============================================================ */

const TaskModal = ({ editingTask, form, setForm, teamMembers, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">TODO Checklist</label>
                    <TodoListInput
                        todoList={form.todoChecklist || []}
                        setTodoList={(value) => setForm((p) => ({ ...p, todoChecklist: value }))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                    />
                </div>
                <AssignMembersField
                    members={teamMembers}
                    value={form.assignedTo || []}
                    onChange={(ids) => setForm((p) => ({ ...p, assignedTo: ids }))}
                />
                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Add Attachments</label>
                    <AddAttachmentsInput
                        attachments={form.attachments}
                        setAttachments={(value) => setForm((p) => ({ ...p, attachments: value }))}
                    />
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                        Cancel
                    </button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg">
                        {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);