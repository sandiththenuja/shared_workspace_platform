// pages/Team.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus, Building2, LogIn, Users, Search, Grid, List,
    Loader2, AlertCircle, Lock, Globe, Shield, Eye,
    ListTodo, Crown, ChevronRight,
} from 'lucide-react';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import CreateTeamModal from '../components/modals/CreateTeamModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Team = () => {
    const navigate = useNavigate();
    const { teams, fetchTeams, createTeam, joinTeamByInvite, loading: teamLoading } = useTeam();
    const { authUser, token } = useAuth();
    const {tasks} = useTask()

    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('grid');
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        if (authUser && token) fetchTeams();
    }, [authUser, token]);

    // ===== helpers =====
    const getTeamInitials = (name) => {
        if (!name) return 'T';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const getMemberId = (m) => (m?._id || m?.user?._id || m)?.toString();

    const checkIfUserIsMember = (team) => {
        if (!team || !authUser) return false;
        const uid = authUser._id.toString();
        if (team.createdBy) {
            const creatorId = (team.createdBy._id || team.createdBy).toString();
            if (creatorId === uid) return true;
        }
        return (team.members || []).some((m) => getMemberId(m) === uid);
    };

    const isTeamAdmin = (team) => {
        if (!team?.createdBy || !authUser) return false;
        const creatorId = (team.createdBy._id || team.createdBy).toString();
        return creatorId === authUser._id.toString();
    };

    // ===== derived =====
    const filteredTeams = useMemo(() => {
        if (!searchTerm) return teams;
        const s = searchTerm.toLowerCase();
        return teams.filter(
            (t) =>
                t.name?.toLowerCase().includes(s) ||
                t.description?.toLowerCase().includes(s)
        );
    }, [teams, searchTerm]);

    // ===== handlers =====
    const handleCreateTeam = async (teamData) => {
        setIsCreating(true);
        try {
            const response = await createTeam(teamData);
            await fetchTeams();
            const newTeamId = response?._id || response?.team?._id;
            setShowCreateTeamModal(false);
            toast.success('Team created successfully!');
            if (newTeamId) navigate(`/team/${newTeamId}`);
            return response;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to create team';
            throw new Error(msg);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinTeam = async (inviteCode) => {
        const response = await joinTeamByInvite(inviteCode.trim().toUpperCase());
        await fetchTeams();
        const joinedId = response?._id || response?.team?._id;
        if (joinedId) navigate(`/team/${joinedId}`);
    };

    // ===== loading / auth =====
    if (teamLoading && teams.length === 0) {
        return (
            <>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
            </>
        );
    }

    if (!authUser || !token) {
        return (
            <>
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                        <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
                        Please login to view your teams and collaborate with colleagues.
                    </p>
                </div>
            </>
        );
    }

    // ===== empty state =====
    if (teams.length === 0 && !teamLoading) {
        return (
            <>
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Building2 className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                        No Teams Yet
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4 text-center max-w-sm">
                        Create your first team or join an existing one to start collaborating.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCreateTeamModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create Team
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" /> Join Team
                        </button>
                    </div>
                </div>

                <CreateTeamModal
                    isOpen={showCreateTeamModal}
                    onClose={() => setShowCreateTeamModal(false)}
                    onCreateTeam={handleCreateTeam}
                    isCreating={isCreating}
                />
                <JoinTeamModal
                    isOpen={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    onSubmit={handleJoinTeam}
                />
            </>
        );
    }

    return (
        <>
            <div className="space-y-5 md:space-y-6 pb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            Teams
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Member of {teams.length} team{teams.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="hidden sm:inline">Join Team</span>
                        </button>
                        <button
                            onClick={() => setShowCreateTeamModal(true)}
                            className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Team</span>
                            <span className="sm:hidden">New</span>
                        </button>
                    </div>
                </div>

                {/* Search + view toggle */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search teams..."
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="shrink-0 flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setView('grid')}
                            aria-label="Grid view"
                            className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            aria-label="List view"
                            className={`p-2.5 transition-colors ${view === 'list' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Team list */}
                {filteredTeams.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <Search className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            No teams match "{searchTerm}"
                        </p>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTeams.map((team) => (
                            <TeamCard
                                key={team._id}
                                team={team}
                                isMember={checkIfUserIsMember(team)}
                                isAdmin={isTeamAdmin(team)}
                                getTeamInitials={getTeamInitials}
                                onClick={() => navigate(`/team/${team._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredTeams.map((team) => (
                            <TeamRow
                                key={team._id}
                                team={team}
                                isMember={checkIfUserIsMember(team)}
                                isAdmin={isTeamAdmin(team)}
                                getTeamInitials={getTeamInitials}
                                onClick={() => navigate(`/team/${team._id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateTeamModal
                isOpen={showCreateTeamModal}
                onClose={() => setShowCreateTeamModal(false)}
                onCreateTeam={handleCreateTeam}
                isCreating={isCreating}
            />
            <JoinTeamModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onSubmit={handleJoinTeam}
            />
        </>
    );
};

export default Team;

// ============================================================
// SUB-COMPONENTS
// ============================================================

const TeamCard = ({ team, isMember, isAdmin, getTeamInitials, onClick }) => {
    const cover = team.coverImg || team.image || null;

    return (
        <button
            onClick={onClick}
            className="group text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all overflow-hidden"
        >
            {/* Cover strip */}
            <div className="relative h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                {cover && (
                    <img
                        src={cover}
                        alt={team.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Badges */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <Shield className="w-3 h-3" />
                            Admin
                        </span>
                    )}
                    {!isMember && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-amber-100/95 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <Eye className="w-3 h-3" />
                            View Only
                        </span>
                    )}
                </div>
            </div>

            {/* Avatar overlapping cover */}
            <div className="px-4 -mt-8 relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white dark:border-slate-900 shadow-md overflow-hidden">
                    {cover ? (
                        <img
                            src={cover}
                            alt={team.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        getTeamInitials(team.name)
                    )}
                </div>
            </div>

            <div className="p-4 pt-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate flex-1">
                        {team.name}
                    </h3>
                    {team.isPrivate ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                </div>
                
                {/* Stats row */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {team.members?.length || 0}
                    </span>
                    {/* <span className="inline-flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5" />
                        {team.tasks?.length || 0}
                        {console.log(team)
                        }
                    </span> */}
                    <span className="ml-auto text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Open
                        <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </button>
    );
};

const TeamRow = ({ team, isMember, isAdmin, getTeamInitials, onClick }) => {
    const cover = team.coverImg || team.image || null;

    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-sm transition-all group"
        >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                {cover ? (
                    <img src={cover} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                    getTeamInitials(team.name)
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-slate-800 dark:text-white truncate">
                        {team.name}
                    </p>
                    {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {team.description || 'No description'} · {team.members?.length || 0} members
                </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
    );
};

// ============================================================
// JOIN MODAL (simplified inline)
// ============================================================
const JoinTeamModal = ({ isOpen, onClose, onSubmit }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setError('');
        try {
            await onSubmit(code);
            setCode('');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid invite code');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Join Team</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Enter the invite code</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                        placeholder="ABC123"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        maxLength={20}
                        autoFocus
                    />
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium">Cancel</button>
                        <button type="submit" disabled={loading || !code.trim()} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};