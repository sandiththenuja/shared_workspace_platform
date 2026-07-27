// services/fileService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

export const fileService = {
    // Upload file to team using base64 (PUT method)
    uploadFile: async (file, teamId = null, data = {}) => {
        if (!teamId) {
            throw new Error('Team ID is required for file upload');
        }

        // Convert file to base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

        const token = localStorage.getItem('token');
        
        // Prepare request body
        const requestBody = {
            files: [base64],
            fileNames: [data.fileName || file.name]
        };

        if (data.description) {
            requestBody.fileDescriptions = [data.description];
        }

        // Send via PUT to team endpoint
        const response = await axios.put(
            `${API_URL}/teams/${teamId}`,
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            }
        );
        return response.data;
    },

    // Upload multiple files to team using base64
    uploadMultipleFiles: async (files, teamId, data = {}) => {
        if (!teamId) {
            throw new Error('Team ID is required for file upload');
        }

        // Convert all files to base64
        const base64Files = await Promise.all(
            files.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            })
        );

        const fileNames = files.map(file => file.name);
        const fileDescriptions = data.fileDescriptions || [];

        const token = localStorage.getItem('token');
        
        const requestBody = {
            files: base64Files,
            fileNames: fileNames,
            fileDescriptions: fileDescriptions
        };

        // Send via PUT to team endpoint
        const response = await axios.put(
            `${API_URL}/teams/${teamId}`,
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            }
        );
        return response.data;
    },

    // Get team files
    getTeamFiles: async (teamId) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/teams/${teamId}/files`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    // Delete team file
    deleteTeamFile: async (teamId, fileId) => {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/teams/${teamId}/files/${fileId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    // Download team file
    downloadTeamFile: async (teamId, fileId) => {
        const token = localStorage.getItem('token');
        // Since we store file URL in team, we just need to get the file info
        const response = await axios.get(`${API_URL}/teams/${teamId}/files`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const file = response.data.files.find(f => f._id === fileId);
        if (file) {
            window.open(file.url, '_blank');
            return { success: true, fileUrl: file.url };
        }
        return { success: false, message: 'File not found' };
    },

    // Update team (general purpose)
    updateTeam: async (teamId, data) => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/teams/${teamId}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Format file size
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Get file icon class
    getFileIcon: (fileFormat) => {
        const icons = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'excel': 'fa-file-excel',
            'xlsx': 'fa-file-excel',
            'ppt': 'fa-file-powerpoint',
            'pptx': 'fa-file-powerpoint',
            'image': 'fa-file-image',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image',
            'gif': 'fa-file-image',
            'webp': 'fa-file-image',
            'svg': 'fa-file-image',
            'video': 'fa-file-video',
            'mp4': 'fa-file-video',
            'webm': 'fa-file-video',
            'avi': 'fa-file-video',
            'audio': 'fa-file-audio',
            'mp3': 'fa-file-audio',
            'wav': 'fa-file-audio',
            'ogg': 'fa-file-audio',
            'zip': 'fa-file-archive',
            'rar': 'fa-file-archive',
            '7z': 'fa-file-archive',
            'text': 'fa-file-lines',
            'txt': 'fa-file-lines',
            'csv': 'fa-file-csv',
            'json': 'fa-file-code',
            'xml': 'fa-file-code',
            'html': 'fa-file-code',
            'css': 'fa-file-code',
            'js': 'fa-file-code',
            'file': 'fa-file'
        };
        return icons[fileFormat] || icons.file;
    },

    // Get file color
    getFileColor: (fileFormat) => {
        const colors = {
            'pdf': 'text-red-500',
            'doc': 'text-blue-500',
            'docx': 'text-blue-500',
            'excel': 'text-emerald-500',
            'xlsx': 'text-emerald-500',
            'ppt': 'text-orange-500',
            'pptx': 'text-orange-500',
            'image': 'text-purple-500',
            'jpg': 'text-purple-500',
            'jpeg': 'text-purple-500',
            'png': 'text-purple-500',
            'gif': 'text-purple-500',
            'webp': 'text-purple-500',
            'svg': 'text-purple-500',
            'video': 'text-pink-500',
            'mp4': 'text-pink-500',
            'webm': 'text-pink-500',
            'avi': 'text-pink-500',
            'audio': 'text-indigo-500',
            'mp3': 'text-indigo-500',
            'wav': 'text-indigo-500',
            'ogg': 'text-indigo-500',
            'zip': 'text-yellow-500',
            'rar': 'text-yellow-500',
            '7z': 'text-yellow-500',
            'text': 'text-slate-500',
            'txt': 'text-slate-500',
            'csv': 'text-green-500',
            'json': 'text-slate-500',
            'xml': 'text-slate-500',
            'html': 'text-slate-500',
            'css': 'text-slate-500',
            'js': 'text-slate-500'
        };
        return colors[fileFormat] || 'text-slate-400';
    },

    // Get human-readable file type
    getFileTypeLabel: (fileFormat) => {
        const types = {
            'pdf': 'PDF Document',
            'doc': 'Word Document',
            'docx': 'Word Document',
            'excel': 'Excel Spreadsheet',
            'xlsx': 'Excel Spreadsheet',
            'ppt': 'PowerPoint Presentation',
            'pptx': 'PowerPoint Presentation',
            'image': 'Image',
            'jpg': 'Image',
            'jpeg': 'Image',
            'png': 'Image',
            'gif': 'Image',
            'webp': 'Image',
            'svg': 'Image',
            'video': 'Video',
            'mp4': 'Video',
            'webm': 'Video',
            'avi': 'Video',
            'audio': 'Audio',
            'mp3': 'Audio',
            'wav': 'Audio',
            'ogg': 'Audio',
            'zip': 'Archive',
            'rar': 'Archive',
            '7z': 'Archive',
            'text': 'Text Document',
            'txt': 'Text Document',
            'csv': 'CSV File',
            'json': 'JSON File',
            'xml': 'XML File',
            'html': 'HTML File',
            'css': 'CSS File',
            'js': 'JavaScript File'
        };
        return types[fileFormat] || 'File';
    }
};

export default fileService;