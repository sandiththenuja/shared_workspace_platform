// pages/ProfilePage.jsx
import React, { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, Mail, FileText, Camera, X, 
    Loader2, Check, AlertCircle, Save,
    Upload, UserCircle, AtSign, Calendar
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const [selectedImg, setSelectedImg] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { authUser, updateProfile } = useContext(AuthContext);
    
    const [name, setName] = useState(authUser?.fullName || '');
    const [bio, setBio] = useState(authUser?.bio || '');
    const [email, setEmail] = useState(authUser?.email || '');
    const [role, setRole] = useState(authUser?.role || 'member');

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setSelectedImg(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setSelectedImg(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsLoading(true);

        try {
            // Validate name
            if (!name.trim()) {
                setError('Name is required');
                toast.error('Name is required');
                setIsLoading(false);
                return;
            }

            let profileData = {
                fullName: name.trim(),
                bio: bio.trim() || '',
            };

            // If there's a new image, convert to base64
            if (selectedImg) {
                const reader = new FileReader();
                const base64Image = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedImg);
                });
                profileData.profilePic = base64Image;
            }

            const result = await updateProfile(profileData);
            
            if (result?.success) {
                setSuccess(true);
                toast.success('Profile updated successfully!');
                
                // Navigate after a short delay to show success message
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setError(result?.message || 'Failed to update profile');
                toast.error(result?.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'An error occurred while updating profile');
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            Profile Settings
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Update your personal information and profile photo
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-emerald-600 dark:text-emerald-400">
                            Profile updated successfully! Redirecting...
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Profile Photo
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="Profile preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : authUser?.profilePic ? (
                                        <img 
                                            src={authUser.profilePic} 
                                            alt={authUser.fullName} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-white">
                                            {getInitials(authUser?.fullName)}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Upload overlay */}
                                <label
                                    htmlFor="profile-image-upload"
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera className="w-8 h-8 text-white" />
                                </label>
                                <input
                                    ref={fileInputRef}
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex-1 space-y-2">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Upload a profile photo (JPEG, PNG, GIF, or WebP)
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Maximum file size: 5MB
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Photo
                                    </button>
                                    {(previewUrl || authUser?.profilePic) && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    <User className="w-4 h-4 inline mr-1.5" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    <Mail className="w-4 h-4 inline mr-1.5" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Email cannot be changed
                                </p>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    <UserCircle className="w-4 h-4 inline mr-1.5" />
                                    Role
                                </label>
                                <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <span className={`px-2 py-1 text-sm rounded-full ${
                                        role === 'admin' 
                                            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                            : role === 'member'
                                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    <FileText className="w-4 h-4 inline mr-1.5" />
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all resize-none"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {bio.length}/200 characters
                                </p>
                            </div>

                            {/* Joined Date */}
                            {authUser?.createdAt && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        <Calendar className="w-4 h-4 inline mr-1.5" />
                                        Joined
                                    </label>
                                    <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                        {formatDate(authUser.createdAt)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Account Statistics */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 text-center">
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                            {authUser?.teams?.length || 0}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Teams</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 text-center">
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                            0
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tasks</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 text-center">
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                            0
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Messages</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;