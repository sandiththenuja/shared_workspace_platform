// components/TeamFileUpload.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Check, AlertCircle, File, FileText, Image } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeamFileUpload = ({ teamId, onFileUploaded }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (!selectedFiles.length) return;

        // Validate file size (50MB max)
        const invalidFiles = selectedFiles.filter(file => file.size > 50 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            toast.error(`${invalidFiles.length} file(s) exceed 50MB limit`);
            return;
        }

        setFiles(selectedFiles.map(file => ({
            file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending'
        })));
    };

    const removeFile = (index) => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUpload = async () => {
        if (!files.length) {
            toast.error('Please select at least one file');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Convert all files to base64
            const base64Files = await Promise.all(files.map(f => convertToBase64(f.file)));
            const fileNames = files.map(f => f.name);

            const token = localStorage.getItem('token');

            // Send all files as base64 in one PUT request
            const response = await axios.put(
                `/api/teams/${teamId}`,
                {
                    files: base64Files,
                    fileNames: fileNames
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            );

            if (response.data.success) {
                setFiles(prev => prev.map(f => ({ ...f, status: 'completed' })));
                toast.success(`${files.length} file(s) uploaded successfully`);
                
                // Callback with updated team data
                if (onFileUploaded) {
                    onFileUploaded(response.data.team);
                }
                
                // Auto close after success
                setTimeout(() => {
                    setShowUploadModal(false);
                    setFiles([]);
                }, 2000);
            } else {
                toast.error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to upload files';
            toast.error(errorMsg);
            setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file) => {
        const type = file.type;
        if (type.startsWith('image/')) return Image;
        if (type === 'application/pdf') return FileText;
        return File;
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'uploading': return <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />;
            case 'completed': return <Check className="w-5 h-5 text-emerald-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    return (
        <>
            <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
                <Upload className="w-4 h-4" />
                Upload Files
            </button>

            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
                        {/* Header */}
                        <div className="border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                        Upload Files
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {files.length} file(s) selected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                    files.length > 0 
                                        ? 'border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Upload className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Drop files here or click to browse
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    PDF, Word, Excel, Images & more (Max 50MB)
                                </p>
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {files.map((file, index) => {
                                        const FileIcon = getFileIcon(file);
                                        const statusIcon = getStatusIcon(file.status);

                                        return (
                                            <div
                                                key={index}
                                                className={`flex items-center gap-3 p-3 rounded-xl border ${
                                                    file.status === 'completed' 
                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200'
                                                        : file.status === 'error'
                                                        ? 'bg-red-50 dark:bg-red-500/10 border-red-200'
                                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                {file.preview ? (
                                                    <img 
                                                        src={file.preview} 
                                                        alt={file.name} 
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                                        <FileIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {statusIcon}
                                                    {!file.status && (
                                                        <button
                                                            onClick={() => removeFile(index)}
                                                            className="p-1 hover:bg-slate-200 rounded"
                                                        >
                                                            <X className="w-4 h-4 text-slate-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Progress */}
                            {uploading && (
                                <div className="mt-4">
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-500 text-center mt-1">
                                        {uploadProgress}% complete
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setFiles([]);
                                }}
                                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!files.length || uploading}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload {files.length} file{files.length > 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TeamFileUpload;