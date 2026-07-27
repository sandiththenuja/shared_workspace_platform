// components/team/CreateTeamModal.js
import React, { useState } from 'react';
import { 
    X, Loader2, Building2, Users, Lock, Globe, 
    Hash, FileText, AlertCircle, CheckCircle2, Copy,
    Link2, Camera
} from 'lucide-react';

const CreateTeamModal = ({ 
    isOpen, 
    onClose, 
    onCreateTeam,
    isCreating 
}) => {
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('private'); // 'private' or 'public'
    const [inviteCode, setInviteCode] = useState('');
    const [errors, setErrors] = useState({});
    const [createdTeam, setCreatedTeam] = useState(null);

    const [teamImage, setTeamImage] = useState(null);
    const [teamImagePreview, setTeamImagePreview] = useState(null);

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setTeamName('');
            setDescription('');
            setPrivacy('private');
            setInviteCode('');
            setErrors({});
            setCreatedTeam(null);
            setTeamImage(null);
            setTeamImagePreview(null);
        }
    }, [isOpen]);

    // Generate random invite code
    const generateInviteCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setInviteCode(result);
    };

    // Auto-generate invite code on mount
    React.useEffect(() => {
        if (isOpen && !inviteCode) {
            generateInviteCode();
        }
    }, [isOpen]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!teamName.trim()) {
            newErrors.teamName = 'Team name is required';
        } else if (teamName.trim().length < 2) {
            newErrors.teamName = 'Team name must be at least 2 characters';
        } else if (teamName.trim().length > 50) {
            newErrors.teamName = 'Team name must be less than 50 characters';
        }

        if (description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        if (inviteCode && inviteCode.length < 4) {
            newErrors.inviteCode = 'Invite code must be at least 4 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const teamData = {
            name: teamName.trim(),
            description: description.trim(),
            privacy,
            inviteCode: inviteCode.trim() || null, // Send empty code as null
            teamImage: teamImagePreview || null
        };

        try {
            const result = await onCreateTeam(teamData);
            if (result) {
                setCreatedTeam(result);
                // Auto-close after 5 seconds or let user copy invite code
                setTimeout(() => {
                    onClose();
                }, 5000);
            }
        } catch (err) {
            setErrors({ 
                submit: err.response?.data?.message || 'Failed to create team. Please try again.' 
            });
        }
    };

    // Copy invite code to clipboard
    const copyInviteCode = () => {
        const code = createdTeam?.inviteCode || inviteCode;
        if (code) {
            navigator.clipboard.writeText(code);
            toast.success('Invite code copied to clipboard!');
        }
    };

    // Copy team link to clipboard
    const copyTeamLink = () => {
        const code = createdTeam?.inviteCode || inviteCode;
        if (code) {
            const link = `${window.location.origin}/${code}/member/invite`;
            navigator.clipboard.writeText(link);
            toast.success('Team link copied to clipboard!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                {createdTeam ? 'Team Created!' : 'Create New Team'}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {createdTeam ? 'Share the invite code with your team members' : 'Set up your team and start collaborating'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                {createdTeam ? (
                    /* Success State */
                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                {createdTeam.name}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Your team has been created successfully!
                            </p>
                        </div>

                        {/* Invite Code */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Team Invite Code
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center text-2xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400 select-all">
                                    {createdTeam.inviteCode || 'N/A'}
                                </code>
                                <button
                                    onClick={copyInviteCode}
                                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    title="Copy invite code"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                Share this code with people you want to invite to your team.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                        >
                            Go to Team
                        </button>
                    </div>
                ) : (
                    /* Form State */
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Team Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Team Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="e.g., Engineering Squad, Project Alpha"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 ${
                                        errors.teamName 
                                            ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' 
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                    maxLength={50}
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                                    {teamName.length}/50
                                </span>
                            </div>
                            {errors.teamName && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.teamName}
                                </p>
                            )}
                        </div>

                        {/* Team Image */}
                        {/* <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Team Image (Optional)
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {teamImagePreview ? (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                            <img 
                                                src={teamImagePreview} 
                                                alt="Team preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTeamImagePreview(null);
                                                    setTeamImage(null);
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                                            <Camera className="w-6 h-6 text-slate-400" />
                                            <span className="text-xs text-slate-400 mt-1">Add</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setTeamImage(file);
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            setTeamImagePreview(event.target.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    <p>Upload a team logo or photo</p>
                                    <p>JPEG, PNG, GIF or WebP (max 5MB)</p>
                                </div>
                            </div>
                        </div> */}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Description
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the purpose of this team..."
                                    rows={3}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 resize-none ${
                                        errors.description 
                                            ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' 
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                    maxLength={500}
                                />
                                <span className="absolute right-3 bottom-2 text-xs text-slate-400">
                                    {description.length}/500
                                </span>
                            </div>
                            {errors.description && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Invite Code */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Invite Code
                                </label>
                                <button
                                    type="button"
                                    onClick={generateInviteCode}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                    {/* <RefreshCw className="w-3 h-3" /> */}
                                    Generate New
                                </button>
                            </div>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., TEAM123 (optional)"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 uppercase font-mono tracking-wider ${
                                        errors.inviteCode 
                                            ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500' 
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                    maxLength={20}
                                />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Leave empty to auto-generate a random code
                            </p>
                            {errors.inviteCode && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.inviteCode}
                                </p>
                            )}
                        </div>

                        {/* Privacy Setting */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Privacy
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPrivacy('private')}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                        privacy === 'private'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <Lock className={`w-5 h-5 ${
                                        privacy === 'private' 
                                            ? 'text-indigo-600 dark:text-indigo-400' 
                                            : 'text-slate-400'
                                    }`} />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">Private</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Only invited members</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrivacy('public')}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                        privacy === 'public'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <Globe className={`w-5 h-5 ${
                                        privacy === 'public' 
                                            ? 'text-indigo-600 dark:text-indigo-400' 
                                            : 'text-slate-400'
                                    }`} />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">Public</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Visible to everyone</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating || !teamName.trim()}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Building2 className="w-4 h-4" />
                                        Create Team
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateTeamModal;