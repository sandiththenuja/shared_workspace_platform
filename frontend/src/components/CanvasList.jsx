// components/CanvasList.jsx
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Users, Clock, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CanvasList = ({ teamId, onSelectCanvas, onCreateCanvas }) => {
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCanvas, setNewCanvas] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchCanvases();
    }, [teamId]);

    const fetchCanvases = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/canvases/team/${teamId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setCanvases(response.data.canvases);
            }
        } catch (error) {
            console.error('Failed to fetch canvases:', error);
            toast.error('Failed to load canvases');
        } finally {
            setLoading(false);
        }
    };

    const createCanvas = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/canvases',
                {
                    ...newCanvas,
                    teamId
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.data.success) {
                setCanvases([response.data.canvas, ...canvases]);
                setShowCreateModal(false);
                setNewCanvas({ name: '', description: '' });
                toast.success('Canvas created');
                if (onCreateCanvas) {
                    onCreateCanvas(response.data.canvas);
                }
            }
        } catch (error) {
            console.error('Failed to create canvas:', error);
            toast.error('Failed to create canvas');
        }
    };

    const deleteCanvas = async (canvasId) => {
        if (!window.confirm('Are you sure you want to delete this canvas?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/api/canvases/${canvasId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setCanvases(canvases.filter(c => c._id !== canvasId));
                toast.success('Canvas deleted');
            }
        } catch (error) {
            console.error('Failed to delete canvas:', error);
            toast.error('Failed to delete canvas');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Canvases
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                        ({canvases.length})
                    </span>
                </h3>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Canvas
                </button>
            </div>

            {/* Canvas Grid */}
            {canvases.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h4 className="text-lg font-medium text-slate-800 dark:text-white">No canvases yet</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Create your first canvas to start drawing
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {canvases.map((canvas) => (
                        <div
                            key={canvas._id}
                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 hover:shadow-lg transition-shadow group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-800 dark:text-white truncate">
                                        {canvas.name}
                                    </h4>
                                    {canvas.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                                            {canvas.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {canvas.collaborators?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(canvas.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onSelectCanvas(canvas._id)}
                                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Open"
                                    >
                                        <Eye className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => deleteCanvas(canvas._id)}
                                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-400">
                                    Created by {canvas.createdBy?.fullName || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Create New Canvas
                        </h3>
                        <form onSubmit={createCanvas}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCanvas.name}
                                    onChange={(e) => setNewCanvas({ ...newCanvas, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newCanvas.description}
                                    onChange={(e) => setNewCanvas({ ...newCanvas, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CanvasList;