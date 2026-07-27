// context/FileContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { fileService } from '../services/fileService';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadFile = async (file, teamId, data = {}) => {
        setLoading(true);
        try {
            const result = await fileService.uploadFile(file, teamId, data);
            if (result.success) {
                setFiles(prev => [result.file, ...prev]);
                return result;
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getFiles = async (filters = {}) => {
        setLoading(true);
        try {
            const data = await fileService.getFiles(filters);
            if (data.success) {
                setFiles(data.files);
                return data;
            }
        } catch (error) {
            console.error('Get files error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteFile = async (fileId) => {
        setLoading(true);
        try {
            const result = await fileService.deleteFile(fileId);
            if (result.success) {
                setFiles(prev => prev.filter(f => f._id !== fileId));
                return result;
            }
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (fileId) => {
        try {
            const result = await fileService.downloadFile(fileId);
            return result;
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    };

    const value = {
        files,
        setFiles,
        loading,
        uploadProgress,
        uploadFile,
        getFiles,
        deleteFile,
        downloadFile
    };

    return (
        <FileContext.Provider value={value}>
            {children}
        </FileContext.Provider>
    );
};

export const useFile = () => {
    const context = useContext(FileContext);
    if (!context) {
        throw new Error('useFile must be used within a FileProvider');
    }
    return context;
};