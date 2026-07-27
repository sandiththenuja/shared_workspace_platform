// utils/downloadUtils.js
import axios from 'axios';
import toast from 'react-hot-toast';

export const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const versionIndex = parts.findIndex(part => part.startsWith('v'));
        if (versionIndex === -1) return null;
        return parts.slice(versionIndex + 1).join('/');
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

export const downloadCloudinaryFile = async (file, teamId) => {
    try {
        if (!file?.url) {
            toast.error('File URL is missing');
            return { success: false, message: 'File URL is missing' };
        }

        // Extract public ID from URL
        const publicId = getPublicIdFromUrl(file.url);
        if (!publicId) {
            toast.error('Could not extract file ID');
            return { success: false, message: 'Could not extract file ID' };
        }

        const token = localStorage.getItem('token');
        
        // Get signed download URL from backend
        const response = await axios.post(
            '/api/cloudinary/generate-download-url',
            {
                publicId: publicId,
                filename: file.name || 'download',
                fileId: file._id,
                teamId: teamId
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            // Open the download URL in a new tab
            window.open(response.data.downloadUrl, '_blank');
            toast.success('Download started');
            return { success: true, message: 'Download started' };
        } else {
            toast.error(response.data.message || 'Failed to generate download URL');
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        console.error('Download error:', error);
        const errorMsg = error.response?.data?.message || 'Failed to download file';
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
    }
};

// Simple download without tracking (for public files)
export const downloadFileSimple = async (file) => {
    try {
        if (!file?.url) {
            toast.error('File URL is missing');
            return { success: false };
        }

        // Just open the file URL directly
        window.open(file.url, '_blank');
        toast.success('Download started');
        return { success: true };
    } catch (error) {
        toast.error('Download failed');
        return { success: false };
    }
};