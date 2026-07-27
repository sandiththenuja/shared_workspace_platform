// components/TeamFileList.jsx - Complete safe version
import React, { useState } from 'react';
import { 
    File, FileText, Download, Trash2, Search, 
    Loader2, Clock, Image, Users, Eye, Play, Music
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { downloadCloudinaryFile } from '../lib/download';

const TeamFileList = ({ files = [], teamId, onFileDeleted, isAdmin = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ Ensure files is always an array
    const safeFiles = Array.isArray(files) ? files : [];

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/api/teams/${teamId}/files/${fileId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('File deleted successfully');
                if (onFileDeleted) {
                    onFileDeleted(fileId);
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete file');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (file) => {
        setLoading(true);
        try {
            const result = await downloadCloudinaryFile(file, teamId);
            if (!result.success) {
                console.error('Download failed:', result.message);
            }
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (file) => {
        const name = file?.name || '';
        const ext = name.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
            return <Image className="w-5 h-5 text-purple-500" />;
        }
        if (ext === 'pdf') {
            return <FileText className="w-5 h-5 text-red-500" />;
        }
        if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)) {
            return <Play className="w-5 h-5 text-pink-500" />;
        }
        if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
            return <Music className="w-5 h-5 text-indigo-500" />;
        }
        if (['doc', 'docx'].includes(ext)) {
            return <FileText className="w-5 h-5 text-blue-500" />;
        }
        if (['xls', 'xlsx', 'csv'].includes(ext)) {
            return <FileText className="w-5 h-5 text-emerald-500" />;
        }
        if (['ppt', 'pptx'].includes(ext)) {
            return <FileText className="w-5 h-5 text-orange-500" />;
        }
        return <File className="w-5 h-5 text-slate-400" />;
    };

    const getFileColor = (file) => {
        const name = file?.name || '';
        const ext = name.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            return 'text-purple-500';
        }
        if (ext === 'pdf') {
            return 'text-red-500';
        }
        if (['doc', 'docx'].includes(ext)) {
            return 'text-blue-500';
        }
        if (['xls', 'xlsx', 'csv'].includes(ext)) {
            return 'text-emerald-500';
        }
        if (['ppt', 'pptx'].includes(ext)) {
            return 'text-orange-500';
        }
        if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)) {
            return 'text-pink-500';
        }
        if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
            return 'text-indigo-500';
        }
        return 'text-slate-400';
    };

    // ✅ Safe filter with null checks
    const filteredFiles = safeFiles.filter(file => 
        file && file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Search */}
                {safeFiles.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search files..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                )}

                {/* Files List */}
                {filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <File className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p>{safeFiles.length === 0 ? 'No files uploaded yet' : 'No files match your search'}</p>
                        {safeFiles.length === 0 && (
                            <p className="text-sm mt-1">Upload files to share with your team</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredFiles.map((file) => {
                            const fileId = file?._id || file?.id;
                            if (!fileId) return null;
                            
                            return (
                                <div 
                                    key={fileId} 
                                    className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div 
                                            className="flex items-start gap-3 flex-1 min-w-0"
                                            onClick={() => handlePreview(file)}
                                        >
                                            <div className={`p-2 bg-white dark:bg-slate-700 rounded-lg flex-shrink-0 ${getFileColor(file)}`}>
                                                {getFileIcon(file)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 dark:text-white truncate" title={file.name}>
                                                    {file.name || 'Unnamed file'}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {file.fileSize && (
                                                        <span>{formatFileSize(file.fileSize)}</span>
                                                    )}
                                                    {file.uploadedAt && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDate(file.uploadedAt)}
                                                            </span>
                                                        </>
                                                    )}
                                                    {file.uploadedBy && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {file.uploadedBy?.fullName || 'Unknown'}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {file.description && (
                                                    <p className="text-xs text-slate-400 mt-1 truncate">
                                                        {file.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                            <button
            onClick={() => handleDownload(file)}
            disabled={loading}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Download"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4 text-slate-500" />
            )}
        </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(fileId)}
                                                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default TeamFileList;