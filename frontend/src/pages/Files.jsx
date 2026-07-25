// pages/Files.js
import React, { useState } from 'react';
import {
    Folder, File, Image, FileText, FileCode,
    Download, Share2, Trash2, MoreVertical,
    Search, Plus, Grid, List, Clock, Star,
    Upload, Filter, ChevronDown
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';

const Files = () => {
    const [view, setView] = useState('grid');
    const [selectedFolder, setSelectedFolder] = useState('all');

    const folders = [
        { id: 'all', name: 'All Files', icon: Folder, count: 24 },
        { id: 'recent', name: 'Recent', icon: Clock, count: 8 },
        { id: 'starred', name: 'Starred', icon: Star, count: 5 },
        { id: 'shared', name: 'Shared with me', icon: Share2, count: 12 },
    ];

    const files = [
        { id: 1, name: 'Q4_Report.pdf', type: 'pdf', size: '2.4 MB', modified: '2 hours ago', starred: true, shared: true },
        { id: 2, name: 'Website_Design.fig', type: 'figma', size: '4.8 MB', modified: '5 hours ago', starred: false, shared: false },
        { id: 3, name: 'Marketing_Plan.docx', type: 'doc', size: '1.2 MB', modified: '1 day ago', starred: true, shared: true },
        { id: 4, name: 'Logo_Assets.zip', type: 'zip', size: '8.3 MB', modified: '2 days ago', starred: false, shared: false },
        { id: 5, name: 'Dashboard_Screenshot.png', type: 'image', size: '3.1 MB', modified: '3 days ago', starred: false, shared: true },
        { id: 6, name: 'API_Documentation.md', type: 'code', size: '0.5 MB', modified: '4 days ago', starred: true, shared: false },
        { id: 7, name: 'Budget_Spreadsheet.xlsx', type: 'excel', size: '1.8 MB', modified: '5 days ago', starred: false, shared: true },
        { id: 8, name: 'Presentation_Pitch.pptx', type: 'ppt', size: '6.2 MB', modified: '1 week ago', starred: false, shared: false },
    ];

    const getIcon = (type) => {
        switch(type) {
            case 'pdf': return FileText;
            case 'figma': return File;
            case 'doc': return FileText;
            case 'zip': return Folder;
            case 'image': return Image;
            case 'code': return FileCode;
            default: return File;
        }
    };

    const getColor = (type) => {
        switch(type) {
            case 'pdf': return 'text-red-500';
            case 'figma': return 'text-purple-500';
            case 'doc': return 'text-blue-500';
            case 'zip': return 'text-yellow-500';
            case 'image': return 'text-green-500';
            case 'code': return 'text-indigo-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Files</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage and organize your files
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Folder
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search files..."
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                        <ChevronDown className="w-4 h-4" />
                    </button>
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

            {/* Folders */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {folders.map((folder) => (
                    <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            selectedFolder === folder.id
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } border border-slate-200 dark:border-slate-700`}
                    >
                        <folder.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{folder.name}</span>
                        <span className="text-xs text-slate-400">({folder.count})</span>
                    </button>
                ))}
            </div>

            {/* Files Grid */}
            {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {files.map((file) => {
                        const Icon = getIcon(file.type);
                        return (
                            <div key={file.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 hover:shadow-lg transition-shadow group">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800 ${getColor(file.type)}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {file.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                                        {file.shared && <Share2 className="w-4 h-4 text-indigo-400" />}
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <MoreVertical className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="font-medium text-slate-800 dark:text-white truncate">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                        <span>{file.size}</span>
                                        <span>•</span>
                                        <span>{file.modified}</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Preview</button>
                                    <div className="flex items-center gap-2">
                                        <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <Download className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <Trash2 className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View */
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modified</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {files.map((file) => {
                                    const Icon = getIcon(file.type);
                                    return (
                                        <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`${getColor(file.type)}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{file.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            {file.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                                                            {file.shared && <Share2 className="w-3 h-3 text-indigo-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 uppercase">{file.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{file.size}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{file.modified}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button className="text-indigo-600 dark:text-indigo-400 hover:underline">Preview</button>
                                                <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                    <Download className="w-4 h-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
        </DashboardLayout>
    );
};

export default Files;