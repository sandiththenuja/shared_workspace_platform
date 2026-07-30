// pages/CanvasDashboard.jsx - Fixed Canvas View Modal

import React, { useState } from 'react';
import { 
    Plus, FileText, Users, Clock, Eye, Trash2,
    Search, Grid, List, User, X,
    ChevronDown, Minimize2
} from 'lucide-react';
import Canvas from './Canvas';

// ============ MOCK DATA ============
const MOCK_TEAMS = [
    { _id: 'team1', name: 'Design Team' },
    { _id: 'team2', name: 'Development Team' },
    { _id: 'team3', name: 'Marketing Team' },
];

const MOCK_CANVASES = [
    { _id: 'canvas1', name: 'Website Wireframe', description: 'Initial wireframe for the new website', createdBy: { fullName: 'John Doe' }, collaborators: [{ user: { fullName: 'Jane Smith' } }], updatedAt: '2024-01-15T10:30:00Z', thumbnail: null },
    { _id: 'canvas2', name: 'Mobile App Design', description: 'UI/UX design for mobile application', createdBy: { fullName: 'Jane Smith' }, collaborators: [{ user: { fullName: 'John Doe' } }, { user: { fullName: 'Bob Wilson' } }], updatedAt: '2024-01-14T15:45:00Z', thumbnail: null },
    { _id: 'canvas3', name: 'Logo Concepts', description: 'Various logo design concepts', createdBy: { fullName: 'Alice Johnson' }, collaborators: [], updatedAt: '2024-01-13T09:20:00Z', thumbnail: null },
    { _id: 'canvas4', name: 'Dashboard Mockup', description: 'Admin dashboard design mockup', createdBy: { fullName: 'Bob Wilson' }, collaborators: [{ user: { fullName: 'Alice Johnson' } }], updatedAt: '2024-01-12T14:10:00Z', thumbnail: null },
    { _id: 'canvas5', name: 'Presentation Slides', description: 'Slides for the upcoming presentation', createdBy: { fullName: 'John Doe' }, collaborators: [{ user: { fullName: 'Jane Smith' } }, { user: { fullName: 'Alice Johnson' } }], updatedAt: '2024-01-11T11:55:00Z', thumbnail: null },
];

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
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-xl border-2 transition-all cursor-pointer group ${isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700'} hover:shadow-lg transition-all duration-200`} onClick={() => onSelect(canvas._id)}>
            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-xl overflow-hidden">
                <div className="flex items-center justify-center h-full"><FileText className="w-16 h-16 text-slate-300 dark:text-slate-600" /></div>
                {isSelected && <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1"><Eye className="w-4 h-4" /></div>}
                {canvas.collaborators?.length > 0 && <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Users className="w-3 h-3" />{canvas.collaborators.length}</div>}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-white truncate">{canvas.name || 'Untitled'}</h3>
                        {canvas.description && <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{canvas.description}</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(canvas._id); }} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(canvas.updatedAt)}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{canvas.createdBy?.fullName || 'Unknown'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={(e) => { e.stopPropagation(); onSelect(canvas._id); }} className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-1"><Eye className="w-4 h-4" />Open Canvas</button>
                </div>
            </div>
        </div>
    );
};

// ============ TEAM SELECTOR ============
const TeamSelector = ({ teams, currentTeamId, onSelectTeam }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!teams || teams.length === 0) return null;
    const currentTeam = teams.find(t => t._id === currentTeamId);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{currentTeam?.name || 'Select Team'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1">
                    {teams.map((team) => (
                        <button key={team._id} onClick={() => { onSelectTeam(team._id); setIsOpen(false); }} className={`w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${team._id === currentTeamId ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{team.name}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============ CREATE CANVAS MODAL ============
const CreateCanvasModal = ({ isOpen, onClose, onCreate }) => {
    const [newCanvas, setNewCanvas] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newCanvas.name.trim()) return alert('Canvas name is required');
        setLoading(true);
        setTimeout(() => {
            onCreate(newCanvas);
            setNewCanvas({ name: '', description: '' });
            setLoading(false);
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Create New Canvas</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name <span className="text-red-500">*</span></label>
                        <input type="text" value={newCanvas.name} onChange={(e) => setNewCanvas({ ...newCanvas, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter canvas name" required autoFocus />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea value={newCanvas.description} onChange={(e) => setNewCanvas({ ...newCanvas, description: e.target.value })} rows={3} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional description" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create'}
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
            <div className="relative w-full h-full max-w-7xl bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Canvas View</span>
                    </div>
                    <button onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"><Minimize2 className="w-4 h-4" />Close</button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <Canvas canvasId={canvasId} teamId={teamId} onClose={onClose} />
                </div>
            </div>
        </div>
    );
};

// ============ MAIN CANVAS DASHBOARD ============
const CanvasDashboard = () => {
    const [canvases, setCanvases] = useState(MOCK_CANVASES);
    const [selectedCanvasId, setSelectedCanvasId] = useState(null);
    const [showCanvasModal, setShowCanvasModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [viewMode, setViewMode] = useState('grid');
    const [currentTeamId, setCurrentTeamId] = useState(MOCK_TEAMS[0]._id);
    const [userTeams] = useState(MOCK_TEAMS);

    const handleTeamSelect = (teamId) => setCurrentTeamId(teamId);

    const handleCreateCanvas = (canvasData) => {
        const newCanvas = { _id: `canvas${Date.now()}`, name: canvasData.name, description: canvasData.description || '', createdBy: { fullName: 'Current User' }, collaborators: [], updatedAt: new Date().toISOString(), thumbnail: null };
        setCanvases([newCanvas, ...canvases]);
        handleOpenCanvas(newCanvas._id);
    };

    const handleOpenCanvas = (canvasId) => {
        setSelectedCanvasId(canvasId);
        setShowCanvasModal(true);
    };

    const handleDeleteCanvas = (canvasId) => {
        if (!window.confirm('Are you sure you want to delete this canvas?')) return;
        setCanvases(canvases.filter(c => c._id !== canvasId));
        if (selectedCanvasId === canvasId) { setShowCanvasModal(false); setSelectedCanvasId(null); }
    };

    const handleCloseCanvasModal = () => { setShowCanvasModal(false); setSelectedCanvasId(null); };

    const filteredCanvases = canvases
        .filter(canvas => {
            const search = searchTerm.toLowerCase();
            return canvas.name?.toLowerCase().includes(search) || canvas.description?.toLowerCase().includes(search);
        })
        .sort((a, b) => {
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            else if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
            else return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Canvas Gallery</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{filteredCanvases.length} canvases in {userTeams.find(t => t._id === currentTeamId)?.name || 'team'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <TeamSelector teams={userTeams} currentTeamId={currentTeamId} onSelectTeam={handleTeamSelect} />
                            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"><Plus className="w-4 h-4" />New Canvas</button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search canvases..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                                <option value="updatedAt">Last Updated</option><option value="createdAt">Date Created</option><option value="name">Name</option>
                            </select>
                            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}><Grid className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}><List className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    {filteredCanvases.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                            <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <h4 className="text-lg font-medium text-slate-800 dark:text-white">{searchTerm ? 'No matching canvases' : 'No canvases yet'}</h4>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{searchTerm ? 'Try adjusting your search' : 'Create your first canvas to start drawing'}</p>
                            {!searchTerm && <button onClick={() => setShowCreateModal(true)} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Create Canvas</button>}
                        </div>
                    ) : (
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                            {filteredCanvases.map((canvas) => (
                                <CanvasCard key={canvas._id} canvas={canvas} onSelect={handleOpenCanvas} onDelete={handleDeleteCanvas} isSelected={selectedCanvasId === canvas._id} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateCanvasModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateCanvas} />
            <CanvasViewModal isOpen={showCanvasModal} onClose={handleCloseCanvasModal} canvasId={selectedCanvasId} teamId={currentTeamId} />
        </>
    );
};

export default CanvasDashboard;