// pages/CanvasDashboard.jsx - Updated with Modal View

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, FileText, Users, Clock, Loader2, Eye, Trash2,
    Search, Grid, List, User, AlertCircle, X,
    ChevronDown, Maximize2, Minimize2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Canvas from './Canvas';
import { useAuth } from '../context/AuthContext';

// ============ CANVAS CARD COMPONENT ============
const CanvasCard = ({ canvas, onSelect, onDelete, isSelected }) => {
    const formatDate = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const diff = now - new Date(date);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div 
            className={`
                bg-white dark:bg-slate-900 rounded-xl border-2 transition-all cursor-pointer group
                ${isSelected 
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
                    : 'border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700'
                }
                hover:shadow-lg transition-all duration-200
            `}
            onClick={() => onSelect(canvas._id)}
        >
            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-xl overflow-hidden">
                <div className="flex items-center justify-center h-full">
                    <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                </div>
                
                {isSelected && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1">
                        <Eye className="w-4 h-4" />
                    </div>
                )}
                
                {canvas.collaborators?.length > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {canvas.collaborators.length}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                            {canvas.name || 'Untitled'}
                        </h3>
                        {canvas.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                                {canvas.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(canvas._id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                    </button>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(canvas.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {canvas.createdBy?.fullName || 'Unknown'}
                    </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(canvas._id);
                        }}
                        className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                    >
                        <Eye className="w-4 h-4" />
                        Open Canvas
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============ TEAM SELECTOR ============
const TeamSelector = ({ teams, currentTeamId, onSelectTeam }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!teams || teams.length === 0) {
        return null;
    }

    const currentTeam = teams.find(t => t._id === currentTeamId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {currentTeam?.name || 'Select Team'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1">
                    {teams.map((team) => (
                        <button
                            key={team._id}
                            onClick={() => {
                                onSelectTeam(team._id);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                team._id === currentTeamId 
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                    : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            {team.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============ CREATE CANVAS MODAL ============
const CreateCanvasModal = ({ isOpen, onClose, onCreate, teamId }) => {
    const [newCanvas, setNewCanvas] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCanvas.name.trim()) {
            toast.error('Canvas name is required');
            return;
        }

        setLoading(true);
        try {
            await onCreate(newCanvas);
            setNewCanvas({ name: '', description: '' });
            onClose();
        } catch (error) {
            console.error('Error creating canvas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Create New Canvas
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newCanvas.name}
                            onChange={(e) => setNewCanvas({ ...newCanvas, name: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter canvas name"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={newCanvas.description}
                            onChange={(e) => setNewCanvas({ ...newCanvas, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Create'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============ CANVAS VIEW MODAL ============
const CanvasViewModal = ({ isOpen, onClose, canvasId, teamId }) => {
    if (!isOpen || !canvasId) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-7xl bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Canvas View
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                            <Minimize2 className="w-4 h-4" />
                            Close
                        </button>
                    </div>
                </div>

                {/* Canvas Content */}
                <div className="h-[calc(100%-70px)]">
                    <Canvas
                        canvasId={canvasId}
                        teamId={teamId}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

// ============ MAIN CANVAS DASHBOARD ============
const CanvasDashboard = () => {
    const navigate = useNavigate();
    const { authUser } = useAuth();
    
    // State
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCanvasId, setSelectedCanvasId] = useState(null);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [showCanvasModal, setShowCanvasModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [viewMode, setViewMode] = useState('grid');
    const [error, setError] = useState(null);
    const [currentTeamId, setCurrentTeamId] = useState(null);
    const [userTeams, setUserTeams] = useState([]);
    const [fetchingTeams, setFetchingTeams] = useState(true);

    // Fetch user's teams on mount
    useEffect(() => {
        fetchUserTeams();
    }, []);

    const fetchUserTeams = async () => {
        try {
            setFetchingTeams(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            console.log('Fetching user teams...');
            const response = await axios.get('/api/teams', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Teams response:', response.data);

            if (response.data.success) {
                const teams = response.data.teams || [];
                setUserTeams(teams);
                
                if (teams.length === 0) {
                    setError('You are not a member of any team. Please join or create a team first.');
                    setLoading(false);
                    setFetchingTeams(false);
                    return;
                }

                // Use the first team
                const firstTeamId = teams[0]._id;
                setCurrentTeamId(firstTeamId);
                await fetchCanvases(firstTeamId);
            } else {
                setError('Failed to fetch teams');
                setLoading(false);
                setFetchingTeams(false);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError(error.response?.data?.message || 'Failed to load teams');
            }
            setLoading(false);
            setFetchingTeams(false);
        }
    };

    const fetchCanvases = async (teamIdToFetch) => {
        if (!teamIdToFetch) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            console.log('Fetching canvases for team:', teamIdToFetch);

            const response = await axios.get(`/api/canvases/team/${teamIdToFetch}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Canvases response:', response.data);

            if (response.data.success) {
                setCanvases(response.data.canvases || []);
            } else {
                setError(response.data.message || 'Failed to fetch canvases');
            }
        } catch (error) {
            console.error('Failed to fetch canvases:', error);
            console.error('Error details:', error.response?.data);
            
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                toast.error('Session expired. Please login again.');
            } else if (error.response?.status === 403) {
                setError('You don\'t have permission to view these canvases.');
                toast.error('Permission denied');
            } else {
                setError(error.response?.data?.message || 'Failed to load canvases');
                toast.error('Failed to load canvases');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle team selection
    const handleTeamSelect = (teamId) => {
        setCurrentTeamId(teamId);
        fetchCanvases(teamId);
    };

    // Handle canvas creation
    const handleCreateCanvas = async (canvasData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Not authenticated');
                return;
            }

            const response = await axios.post(
                'api/canvases',
                {
                    ...canvasData,
                    teamId: currentTeamId
                },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const newCanvas = response.data.canvas;
                setCanvases([newCanvas, ...canvases]);
                toast.success('Canvas created successfully');
                // Open the canvas in modal
                handleOpenCanvas(newCanvas._id);
            }
        } catch (error) {
            console.error('Failed to create canvas:', error);
            toast.error(error.response?.data?.message || 'Failed to create canvas');
            throw error;
        }
    };

    // Handle canvas selection - Open in Modal
    const handleOpenCanvas = (canvasId) => {
        console.log('Opening canvas in modal:', canvasId);
        if (canvasId) {
            setSelectedCanvasId(canvasId);
            setSelectedTeamId(currentTeamId);
            setShowCanvasModal(true);
        }
    };

    // Handle canvas deletion
    const handleDeleteCanvas = async (canvasId) => {
        if (!window.confirm('Are you sure you want to delete this canvas?')) return;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Not authenticated');
                return;
            }

            const response = await axios.delete(`http://localhost:5000/api/canvases/${canvasId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setCanvases(canvases.filter(c => c._id !== canvasId));
                toast.success('Canvas deleted');
                if (selectedCanvasId === canvasId) {
                    setShowCanvasModal(false);
                    setSelectedCanvasId(null);
                }
            }
        } catch (error) {
            console.error('Failed to delete canvas:', error);
            toast.error(error.response?.data?.message || 'Failed to delete canvas');
        }
    };

    // Handle close canvas modal
    const handleCloseCanvasModal = () => {
        setShowCanvasModal(false);
        setSelectedCanvasId(null);
        setSelectedTeamId(null);
        // Refresh the canvas list
        fetchCanvases(currentTeamId);
    };

    // Filter and sort canvases
    const filteredCanvases = canvases
        .filter(canvas => {
            const search = searchTerm.toLowerCase();
            return canvas.name?.toLowerCase().includes(search) ||
                   canvas.description?.toLowerCase().includes(search);
        })
        .sort((a, b) => {
            if (sortBy === 'name') {
                return (a.name || '').localeCompare(b.name || '');
            } else if (sortBy === 'createdAt') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });

    // Loading state
    if (loading || fetchingTeams) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">Loading canvases...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 p-4">
                <div className="text-center max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-red-200 dark:border-red-800/50">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        Failed to Load Canvases
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => fetchCanvases(currentTeamId)}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                                Canvas Gallery
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {canvases.length} canvases in {userTeams.find(t => t._id === currentTeamId)?.name || 'team'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <TeamSelector
                                teams={userTeams}
                                currentTeamId={currentTeamId}
                                onSelectTeam={handleTeamSelect}
                            />
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Canvas
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search canvases..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                <option value="updatedAt">Last Updated</option>
                                <option value="createdAt">Date Created</option>
                                <option value="name">Name</option>
                            </select>
                            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-colors ${
                                        viewMode === 'grid' 
                                            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' 
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' 
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Grid */}
                    {filteredCanvases.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                            <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <h4 className="text-lg font-medium text-slate-800 dark:text-white">
                                {searchTerm ? 'No matching canvases' : 'No canvases yet'}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {searchTerm ? 'Try adjusting your search' : 'Create your first canvas to start drawing'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                >
                                    Create Canvas
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`
                            grid gap-4
                            ${viewMode === 'grid' 
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                                : 'grid-cols-1'
                            }
                        `}>
                            {filteredCanvases.map((canvas) => (
                                <CanvasCard
                                    key={canvas._id}
                                    canvas={canvas}
                                    onSelect={handleOpenCanvas}
                                    onDelete={handleDeleteCanvas}
                                    isSelected={selectedCanvasId === canvas._id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Canvas Modal */}
            <CreateCanvasModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateCanvas}
                teamId={currentTeamId}
            />

            {/* Canvas View Modal */}
            <CanvasViewModal
                isOpen={showCanvasModal}
                onClose={handleCloseCanvasModal}
                canvasId={selectedCanvasId}
                teamId={selectedTeamId}
            />
        </>
    );
};

export default CanvasDashboard;