// pages/Files.jsx
import React, { useState, useEffect } from 'react';
import {
    Folder, File, Image, FileText, FileCode,
    Download, Share2, Trash2, MoreVertical,
    Search, Plus, Grid, List, Clock, Star,
    Upload, Filter, ChevronDown, Users,
    Loader2, Eye, User, Calendar,
    RefreshCcw
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Files = () => {
    const [view, setView] = useState('grid');
    const [selectedFolder, setSelectedFolder] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [allFiles, setAllFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [expandedFileId, setExpandedFileId] = useState(null);
    
    const { teams, fetchTeams, loading: teamLoading } = useTeam();
    const { authUser, token } = useAuth();

    useEffect(() => {
        if (authUser) {
            fetchAllFiles();
        }
    }, [authUser]);

    // Fetch all files from all teams the user is a member of
    const fetchAllFiles = async () => {
        setLoading(true);
        try {
            // First fetch all teams
            const teamsResult = await fetchTeams();
            
            if (teamsResult && teamsResult.length > 0) {
                // Collect files from all teams
                let allTeamFiles = [];
                
                for (const team of teamsResult) {
                    if (team.files && team.files.length > 0) {
                        // Add team info to each file
                        const teamFiles = team.files.map(file => ({
                            ...file,
                            teamId: team._id,
                            teamName: team.name,
                            teamImage: team.image || null,
                            uploadedBy: file.uploadedBy || team.createdBy,
                            // Add additional metadata
                            fileSize: file.fileSize || 0,
                            fileType: file.fileType || '',
                            uploadedAt: file.uploadedAt || file.createdAt || new Date(),
                            isStarred: file.isStarred || false,
                            isPinned: file.isPinned || false,
                            description: file.description || '',
                            views: file.views || 0,
                            downloads: file.downloads || 0
                        }));
                        allTeamFiles = [...allTeamFiles, ...teamFiles];
                    }
                }
                
                setAllFiles(allTeamFiles);
                console.log('📎 All files loaded:', allTeamFiles.length);
            }
        } catch (error) {
            console.error('Failed to fetch files:', error);
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    // Get file icon based on file type
    const getFileIcon = (file) => {
        const fileName = file.name || '';
        const ext = fileName.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
            return <Image className="w-6 h-6 text-purple-500" />;
        }
        if (ext === 'pdf') {
            return <FileText className="w-6 h-6 text-red-500" />;
        }
        if (['doc', 'docx'].includes(ext)) {
            return <FileText className="w-6 h-6 text-blue-500" />;
        }
        if (['xls', 'xlsx', 'csv'].includes(ext)) {
            return <FileText className="w-6 h-6 text-emerald-500" />;
        }
        if (['ppt', 'pptx'].includes(ext)) {
            return <FileText className="w-6 h-6 text-orange-500" />;
        }
        if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)) {
            return <File className="w-6 h-6 text-pink-500" />;
        }
        if (['zip', 'rar', '7z'].includes(ext)) {
            return <Folder className="w-6 h-6 text-yellow-500" />;
        }
        if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml'].includes(ext)) {
            return <FileCode className="w-6 h-6 text-indigo-500" />;
        }
        return <File className="w-6 h-6 text-slate-400" />;
    };

    const getFileColor = (file) => {
        const fileName = file.name || '';
        const ext = fileName.split('.').pop()?.toLowerCase();
        
        const colors = {
            'pdf': 'text-red-500',
            'doc': 'text-blue-500',
            'docx': 'text-blue-500',
            'xls': 'text-emerald-500',
            'xlsx': 'text-emerald-500',
            'csv': 'text-emerald-500',
            'ppt': 'text-orange-500',
            'pptx': 'text-orange-500',
            'jpg': 'text-purple-500',
            'jpeg': 'text-purple-500',
            'png': 'text-purple-500',
            'gif': 'text-purple-500',
            'webp': 'text-purple-500',
            'svg': 'text-purple-500',
            'mp4': 'text-pink-500',
            'webm': 'text-pink-500',
            'zip': 'text-yellow-500',
            'rar': 'text-yellow-500',
            'js': 'text-indigo-500',
            'jsx': 'text-indigo-500',
            'ts': 'text-indigo-500',
            'tsx': 'text-indigo-500',
            'html': 'text-indigo-500',
            'css': 'text-indigo-500',
            'json': 'text-indigo-500',
            'xml': 'text-indigo-500'
        };
        return colors[ext] || 'text-slate-400';
    };

    const getFileTypeLabel = (file) => {
        const fileName = file.name || '';
        const ext = fileName.split('.').pop()?.toLowerCase();
        
        const types = {
            'pdf': 'PDF Document',
            'doc': 'Word Document',
            'docx': 'Word Document',
            'xls': 'Excel Spreadsheet',
            'xlsx': 'Excel Spreadsheet',
            'csv': 'CSV File',
            'ppt': 'PowerPoint',
            'pptx': 'PowerPoint',
            'jpg': 'Image',
            'jpeg': 'Image',
            'png': 'Image',
            'gif': 'Image',
            'webp': 'Image',
            'svg': 'Image',
            'mp4': 'Video',
            'webm': 'Video',
            'zip': 'Archive',
            'rar': 'Archive',
            'js': 'JavaScript',
            'jsx': 'React Component',
            'ts': 'TypeScript',
            'tsx': 'React TypeScript',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'xml': 'XML'
        };
        return types[ext] || 'File';
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

    const handleDownload = async (file) => {
        if (file.url) {
            window.open(file.url, '_blank');
            toast.success('Download started');
        } else {
            toast.error('File URL not available');
        }
    };

    const handlePreview = (file) => {
        setPreviewFile(file);
    };

    const handleDelete = async (file) => {
        if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/api/teams/${file.teamId}/files/${file._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('File deleted successfully');
                // Remove file from list
                setAllFiles(prev => prev.filter(f => f._id !== file._id));
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete file');
        }
    };

    // Filter files
    const filteredFiles = allFiles.filter(file => {
        // Search filter
        const matchesSearch = file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             file.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Type filter
        let matchesType = true;
        if (filterType !== 'all') {
            const ext = file.name?.split('.').pop()?.toLowerCase();
            matchesType = ext === filterType;
        }
        
        // Folder filter
        let matchesFolder = true;
        if (selectedFolder === 'starred') {
            matchesFolder = file.isStarred === true;
        } else if (selectedFolder === 'recent') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            matchesFolder = new Date(file.uploadedAt) >= sevenDaysAgo;
        } else if (selectedFolder === 'shared') {
            // Shared with me - files from other teams
            matchesFolder = true; // Add your logic here
        }
        
        return matchesSearch && matchesType && matchesFolder;
    });

    // Group files by team
    const filesByTeam = filteredFiles.reduce((acc, file) => {
        const teamId = file.teamId;
        if (!acc[teamId]) {
            acc[teamId] = {
                teamName: file.teamName,
                files: []
            };
        }
        acc[teamId].files.push(file);
        return acc;
    }, {});

    if (loading || teamLoading) {
        return (
            <>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            Files
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {allFiles.length} files shared across {Object.keys(filesByTeam).length} teams
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchAllFiles}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>
                        {/* <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload
                        </button> */}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search files..."
                            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Types</option>
                            <option value="pdf">PDF</option>
                            <option value="doc">Word</option>
                            <option value="docx">Word</option>
                            <option value="xls">Excel</option>
                            <option value="xlsx">Excel</option>
                            <option value="csv">CSV</option>
                            <option value="ppt">PowerPoint</option>
                            <option value="pptx">PowerPoint</option>
                            <option value="jpg">Image</option>
                            <option value="jpeg">Image</option>
                            <option value="png">Image</option>
                            <option value="mp4">Video</option>
                            <option value="zip">Archive</option>
                            <option value="js">JavaScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="json">JSON</option>
                        </select>
                        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <button 
                                onClick={() => setView('grid')}
                                className={`p-2 transition-colors ${view === 'grid' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setView('list')}
                                className={`p-2 transition-colors ${view === 'list' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Folders / Filters */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedFolder('all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            selectedFolder === 'all'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } border border-slate-200 dark:border-slate-700`}
                    >
                        <Folder className="w-4 h-4" />
                        <span className="text-sm font-medium">All Files</span>
                        <span className="text-xs text-slate-400">({allFiles.length})</span>
                    </button>
                    <button
                        onClick={() => setSelectedFolder('recent')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            selectedFolder === 'recent'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } border border-slate-200 dark:border-slate-700`}
                    >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Recent</span>
                        <span className="text-xs text-slate-400">
                            ({allFiles.filter(f => new Date(f.uploadedAt) >= new Date(Date.now() - 7*24*60*60*1000)).length})
                        </span>
                    </button>
                    {/* <button
                        onClick={() => setSelectedFolder('starred')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            selectedFolder === 'starred'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } border border-slate-200 dark:border-slate-700`}
                    >
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">Starred</span>
                        <span className="text-xs text-slate-400">
                            ({allFiles.filter(f => f.isStarred).length})
                        </span>
                    </button> */}
                    {/* <button
                        onClick={() => setSelectedFolder('shared')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            selectedFolder === 'shared'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } border border-slate-200 dark:border-slate-700`}
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Shared</span>
                        <span className="text-xs text-slate-400">
                            ({allFiles.filter(f => f.shared || f.isPublic).length})
                        </span>
                    </button> */}
                </div>

                {/* Files Display */}
                {filteredFiles.length === 0 ? (
    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        <File className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-800 dark:text-white">No files found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Files shared with you will appear here'}
        </p>
    </div>
) : view === 'grid' ? (
    /* ============ GRID VIEW (unchanged) ============ */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => {
            const Icon = getFileIcon(file);
            return (
                <div key={file._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 hover:shadow-lg transition-shadow group">
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800 ${getFileColor(file)}`}>
                            {Icon}
                        </div>
                        <div className="flex items-center gap-1">
                            {file.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                            {file.isPinned && <Star className="w-4 h-4 text-indigo-400 fill-indigo-400" />}
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="font-medium text-slate-800 dark:text-white truncate" title={file.name}>
                            {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span>•</span>
                            <span>{getFileTypeLabel(file)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <Users className="w-3 h-3" />
                            <span>{file.teamName || 'Unknown Team'}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(file.uploadedAt)}</span>
                        </div>
                        {file.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {file.description}
                            </p>
                        )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                        <button
                            onClick={() => handleDownload(file)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download"
                        >
                            <Download className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                            onClick={() => handleDelete(file)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
) : (
    /* ============ LIST VIEW ============ */
    <>
        {/* ---------- SMALL SCREEN: icon toggles details ---------- */}
        <div className="md:hidden space-y-2 w-screen -m-4 mb-2">
            {filteredFiles.map((file) => {
                const Icon = getFileIcon(file);
                const isOpen = expandedFileId === file._id;

                return (
                    <div
                        key={file._id}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden transition-all"
                    >
                        {/* Header row — icon toggles details */}
                        <div className="flex items-center gap-3 p-3">
                            <button
                                onClick={() =>
                                    setExpandedFileId(isOpen ? null : file._id)
                                }
                                aria-label={isOpen ? 'Hide details' : 'Show details'}
                                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all
                                           bg-slate-50 dark:bg-slate-800 ${getFileColor(file)}
                                           ${isOpen ? 'ring-2 ring-indigo-500/40' : ''}`}
                            >
                                {Icon}
                            </button>

                            <button
                                onClick={() =>
                                    setExpandedFileId(isOpen ? null : file._id)
                                }
                                className="flex-1 min-w-0 text-left"
                            >
                                <p
                                    className="font-medium text-sm text-slate-800 dark:text-white truncate"
                                    title={file.name}
                                >
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                    {getFileTypeLabel(file)} • {formatFileSize(file.fileSize)}
                                </p>
                            </button>

                            <div className="flex items-center gap-0.5 shrink-0">
                                {file.isStarred && (
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                )}
                                {file.isPinned && (
                                    <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                                )}
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform ${
                                        isOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Expanded details */}
                        {isOpen && (
                            <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5">
                                {/* Meta grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <DetailItem
                                        icon={FileText}
                                        label="Type"
                                        value={getFileTypeLabel(file)}
                                    />
                                    <DetailItem
                                        icon={Download}
                                        label="Size"
                                        value={formatFileSize(file.fileSize)}
                                    />
                                    <DetailItem
                                        icon={Users}
                                        label="Team"
                                        value={file.teamName || 'Unknown'}
                                    />
                                    <DetailItem
                                        icon={Clock}
                                        label="Modified"
                                        value={formatDate(file.uploadedAt)}
                                    />
                                </div>

                                {/* Description */}
                                {file.description && (
                                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1">
                                            Description
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            {file.description}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                                                   text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800
                                                   hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                                                   hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                                                   text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10
                                                   hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* ---------- DESKTOP / TABLET: full table ---------- */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
            <div className="relative">
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-20 bg-gradient-to-l from-white dark:from-slate-900 to-transparent lg:hidden" />

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <table className="w-full min-w-[720px] lg:min-w-[900px]">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">
                                    Name
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px]">
                                    Team
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[100px]">
                                    Type
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[90px]">
                                    Size
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px]">
                                    Modified
                                </th>
                                <th className="sticky right-0 z-10 bg-slate-50 dark:bg-slate-800 px-4 lg:px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[110px]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredFiles.map((file) => {
                                const Icon = getFileIcon(file);
                                return (
                                    <tr
                                        key={file._id}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <td className="sticky left-0 z-[1] bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 px-4 lg:px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="shrink-0">{Icon}</div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-slate-800 dark:text-white truncate max-w-[180px]">
                                                        {file.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {file.isStarred && (
                                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                        )}
                                                        {file.isPinned && (
                                                            <Star className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                                                        )}
                                                        {file.description && (
                                                            <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                                                {file.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 lg:px-6 py-3.5">
                                            <span className="text-sm text-slate-600 dark:text-slate-300 truncate inline-block max-w-[120px]">
                                                {file.teamName || 'Unknown'}
                                            </span>
                                        </td>

                                        <td className="px-4 lg:px-6 py-3.5 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {getFileTypeLabel(file)}
                                        </td>

                                        <td className="px-4 lg:px-6 py-3.5 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {formatFileSize(file.fileSize)}
                                        </td>

                                        <td className="px-4 lg:px-6 py-3.5 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {formatDate(file.uploadedAt)}
                                        </td>

                                        <td className="sticky right-0 z-[1] bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 px-4 lg:px-6 py-3.5 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDownload(file)}
                                                    aria-label="Download"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file)}
                                                    aria-label="Delete"
                                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scroll hint on tablet */}
            <div className="lg:hidden flex items-center justify-center gap-1.5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Swipe to see all columns →
                </span>
            </div>
        </div>
    </>
)}

            </div>
        </>
    );
};

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-0.5">
            <Icon className="w-3 h-3 shrink-0" />
            {label}
        </div>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
            {value}
        </p>
    </div>
);

export default Files;