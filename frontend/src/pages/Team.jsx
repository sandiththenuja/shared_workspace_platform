// pages/Team.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    UserPlus, Search, Filter, MoreVertical, 
    Mail, Phone, Calendar, Star, Users,
    ChevronDown, Grid, List, Award, Clock,
    FolderOpen, UserX, Settings, Trash2,
    Loader2, Plus, Building2, UserCheck,
    AlertCircle, Shield, Eye, LogIn, Copy,
    Image, Upload, Camera, X, Link2, Check,
    User, AtSign, Send, FileText, Download as DownloadIcon,
    Edit2, Save, RefreshCw, File, Folder,
    Globe,
    Lock
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import CreateTeamModal from '../components/modals/CreateTeamModal';
import toast from 'react-hot-toast';
import axios from 'axios';

import TeamFiles from '../components/TeamFiles';
import TeamFileList from '../components/TeamFileList';

const Team = () => {
    const [view, setView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);

    // Create team modal state
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Join team modal state
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState(null);

    // Add member modal state
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Edit Team Modal State
    const [showEditTeamModal, setShowEditTeamModal] = useState(false);
    const [editTeamData, setEditTeamData] = useState({
        name: '',
        description: '',
        isPrivate: false,
        coverImg: null,
        coverPreview: null
    });
    const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

    // Team image state
    const [teamImage, setTeamImage] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [selectedImg, setSelectedImg] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [fileUploaded, setFileUploaded] = useState(false);

    const handleFileUploaded = (updatedTeam) => {
    if (updatedTeam) {
        // Update selectedTeam with new files
        setSelectedTeam(updatedTeam);
        // Also update in teams array
        setTeams(prev => 
            prev.map(team => 
                team._id === updatedTeam._id ? updatedTeam : team
            )
        );
        toast.success('Files uploaded successfully!');
    }
    setFileUploaded(prev => !prev);
};

const handleFileDeleted = (fileId) => {
    if (selectedTeam && selectedTeam.files) {
        // Remove the deleted file from selectedTeam
        const updatedFiles = selectedTeam.files.filter(f => 
            (f._id || f.id) !== fileId
        );
        const updatedTeam = {
            ...selectedTeam,
            files: updatedFiles
        };
        setSelectedTeam(updatedTeam);
        // Also update in teams array
        setTeams(prev => 
            prev.map(team => 
                team._id === updatedTeam._id ? updatedTeam : team
            )
        );
    }
    setFileUploaded(prev => !prev);
};

    const { 
        teams, 
        setTeams,
        fetchTeams, 
        getTeamById,
        addTeamMember,
        removeTeamMember,
        leaveTeam,
        createTeam,
        updateTeam,
        deleteTeam,
        joinTeamByInvite,
        uploadTeamImage,
        loading: teamLoading 
    } = useTeam();
    
    const { authUser, token } = useAuth();
    const { getTasks } = useTask();

    // Check if user is authenticated
    useEffect(() => {
        if (!authUser || !token) {
            setError('Please login to view teams');
            return;
        }
        setError(null);
    }, [authUser, token]);

    // Fetch teams on mount
    useEffect(() => {
        const loadTeams = async () => {
            if (!authUser || !token) return;
            
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchTeams();
                console.log('Teams fetched:', result);
            } catch (err) {
                console.error('Failed to fetch teams:', err);
                setError('Failed to load teams. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadTeams();
    }, [authUser, token]);

    // Set first team as selected when teams load
    useEffect(() => {
        if (teams.length > 0 && !selectedTeamId) {
            setSelectedTeamId(teams[0]._id);
            loadTeamDetails(teams[0]._id);
        }
    }, [teams]);

    // Load team details when selectedTeamId changes
    useEffect(() => {
        if (selectedTeamId) {
            loadTeamDetails(selectedTeamId);
        }
    }, [selectedTeamId]);

    // Open edit modal with team data
    const openEditTeamModal = () => {
    if (selectedTeam) {
        setEditTeamData({
            name: selectedTeam.name || '',
            description: selectedTeam.description || '',
            isPrivate: selectedTeam.isPrivate || false,
            coverImg: selectedTeam.coverImg || null,  // Get from coverImg field
            coverPreview: selectedTeam.coverImg || null
        });
        setShowEditTeamModal(true);
    }
};

    // Handle cover image change
    const handleCoverImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }
        
        setSelectedImg(file);
        setPreviewUrl(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.onload = (event) => {
            setEditTeamData(prev => ({
                ...prev,
                coverImg: file,  // Store the file object
                coverPreview: event.target.result  // Store the preview URL
            }));
        };
        reader.readAsDataURL(file);
    };

    // Remove cover image
    const removeCoverImage = () => {
        // setEditTeamData(prev => ({
        //     ...prev,
        //     coverImage: null,
        //     coverPreview: null
        // }));
        // if (coverInputRef.current) {
        //     coverInputRef.current.value = '';
        // }
        setSelectedImg(null);
        setPreviewUrl(null);

        setEditTeamData(prev => ({
            ...prev,
            coverImg: null,
            coverPreview: null
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle update team
    const handleUpdateTeam = async (e) => {
    e.preventDefault();
    
    if (!editTeamData.name.trim()) {
        toast.error('Team name is required');
        return;
    }

    setIsUpdatingTeam(true);
    setError(null);

    try {
        // Prepare update data as JSON
        let updateData = {
            name: editTeamData.name.trim(),
            description: editTeamData.description.trim(),
            isPrivate: editTeamData.isPrivate
        };

        // Handle cover image - use coverImg to match backend
        if (editTeamData.coverImg) {
            const reader = new FileReader()
            const base64Image = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result)
                reader.onerror = reject;
                reader.readAsDataURL(editTeamData.coverImg);
            })
            updateData.coverImg = base64Image
            // If it's a File object
            // if (typeof editTeamData.coverImage === 'object' && editTeamData.coverImage.name) {
            //     const reader = new FileReader();
            //     const base64Image = await new Promise((resolve, reject) => {
            //         reader.onload = () => resolve(reader.result);
            //         reader.onerror = reject;
            //         reader.readAsDataURL(editTeamData.coverImage);
            //     });
            //     updateData.coverImg = base64Image;  // Use coverImg (not coverImage)
        } else if (typeof editTeamData.coverImg === 'string') {
            updateData.coverImg = editTeamData.coverImg;
        }
            // If it's already a URL or base64 string
            // else if (typeof editTeamData.coverImage === 'string') {
            //     updateData.coverImg = editTeamData.coverImage;  // Use coverImg (not coverImage)
            // }
        // }

        const result = await updateTeam(selectedTeam._id, updateData);
            
            if (result?.success) {
                // setSuccess(true);
                setShowEditTeamModal(false);
                await loadTeamDetails(selectedTeam._id);
                await fetchTeams();
                toast.success('Team updated successfully!');
                
                // Navigate after a short delay to show success message
                // setTimeout(() => {
                //     navigate('/dashboard');
                // }, 1500);
                
                console.log(result);
            } else {
                setError(result?.message || 'Failed to update profile');
                toast.error(result?.message || 'Failed to update profile');
            }

        // console.log('Updating team with data:', updateData); // Debug log

        // const result = await updateTeam(selectedTeam._id, updateData);
        
        // if (result) {
        //     setShowEditTeamModal(false);
        //     await loadTeamDetails(selectedTeam._id);
        //     await fetchTeams();
        //     toast.success('Team updated successfully!');
        // }
    } catch (err) {
        console.error('Failed to update team:', err);
        setError(err.response?.data?.message || 'Failed to update team. Please try again.');
        toast.error('Failed to update team');
    } finally {
        setIsUpdatingTeam(false);
    }
};

    const loadTeamDetails = async (teamId) => {
        if (!teamId) return;
        
        setIsLoading(true);
        setError(null);
        setViewOnlyMode(false);
        
        try {
            const team = await getTeamById(teamId);
            if (team) {
                console.log('Team loaded:', team);
                setSelectedTeam(team);
                setTeamImage(team.coverImg || null);
                
                // Check if user is a member
                const isMember = checkIfUserIsMember(team);
                if (!isMember) {
                    setViewOnlyMode(true);
                    setError('You are viewing this team as a guest. Some actions may be limited.');
                }
                
            } else {
                setError('Failed to load team details');
                setSelectedTeam(null);
            }
        } catch (err) {
            console.error('Failed to load team details:', err);
            if (err.response?.status === 403) {
                setViewOnlyMode(true);
                setError('You are not a member of this team. Viewing in read-only mode.');
            } else {
                setError('Failed to load team details. Please try again.');
            }
            setSelectedTeam(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Check if user is a member of the team
    const checkIfUserIsMember = (team) => {
        if (!team || !authUser) return false;
        if (!team.members || !Array.isArray(team.members)) return false;
        
        const userId = authUser._id;
        
        // Check if user is the creator (creator is always a member)
        if (team.createdBy) {
            const creatorId = team.createdBy._id || team.createdBy;
            if (creatorId.toString() === userId.toString()) {
                return true;
            }
        }
        
        // Check if user is in members list
        return team.members.some(member => {
            const memberId = member._id || member.user?._id || member;
            return memberId.toString() === userId.toString();
        });
    };

    // Handle team selection
    const handleTeamSelect = (teamId) => {
        setSelectedTeamId(teamId);
        setError(null);
        setViewOnlyMode(false);
    };

    // Handle create team
    const handleCreateTeam = async (teamData) => {
        setIsCreating(true);
        
        try {
            const response = await createTeam(teamData);
            await fetchTeams();
            
            const newTeamId = response?._id || response?.team?._id;
            if (newTeamId) {
                setSelectedTeamId(newTeamId);
                await loadTeamDetails(newTeamId);
            }
            
            setShowCreateTeamModal(false);
            toast.success('Team created successfully!');
            
            return response;
        } catch (err) {
            console.error('Failed to create team:', err);
            const errorMessage = 
                err.response?.data?.message || 
                err.message || 
                'Failed to create team. Please try again.';
            throw new Error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    // Handle join team by invite code
    const handleJoinTeam = async (e) => {
        e.preventDefault();
        
        if (!joinCode.trim()) {
            setJoinError('Please enter an invite code');
            return;
        }

        setIsJoining(true);
        setJoinError(null);

        try {
            const response = await joinTeamByInvite(joinCode.trim().toUpperCase());
            
            if (response) {
                setJoinCode('');
                setShowJoinModal(false);
                await fetchTeams();
                
                const joinedTeamId = response._id || response.team?._id;
                if (joinedTeamId) {
                    setSelectedTeamId(joinedTeamId);
                    await loadTeamDetails(joinedTeamId);
                }
                
                toast.success('Successfully joined the team!');
            }
        } catch (err) {
            console.error('Failed to join team:', err);
            const errorMessage = 
                err.response?.data?.message || 
                'Invalid invite code. Please check and try again.';
            setJoinError(errorMessage);
        } finally {
            setIsJoining(false);
        }
    };

    const fetchAllUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await axios.get('/api/auth/users');
            const data = response.data
            
            let usersList = [];
            if (data && data.success && Array.isArray(data.users)) {
                usersList = data.users;
            } else if (data && Array.isArray(data)) {
                usersList = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                usersList = data.data;
            } else {
                usersList = data?.users || data?.data || [];
            }
            
            if (!Array.isArray(usersList)) {
                usersList = [];
            }
            
            const existingMemberIds = selectedTeam?.members?.map(m => m._id || m) || [];
            const filteredUsers = usersList.filter(user => 
                user && user._id !== authUser?._id && 
                !existingMemberIds.includes(user._id)
            );
            
            setAllUsers(filteredUsers);
            
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error(error.response?.data?.message || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    // ===== OPEN ADD MEMBER MODAL =====
    const openAddMemberModal = async () => {
        setShowAddMemberModal(true);
        setSelectedUsers([]);
        setUserSearchTerm('');
        await fetchAllUsers();
    };

    // ===== TOGGLE USER SELECTION =====
    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    // ===== SELECT ALL USERS =====
    const selectAllUsers = () => {
        const allUserIds = filteredUsers.map(user => user._id);
        setSelectedUsers(allUserIds);
    };

    // ===== DESELECT ALL USERS =====
    const deselectAllUsers = () => {
        setSelectedUsers([]);
    };

    // ===== ADD SELECTED USERS TO TEAM =====
    const handleAddSelectedUsers = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        setIsLoading(true);
        let successCount = 0;
        const failedUsers = [];

        for (const userId of selectedUsers) {
            try {
                const user = allUsers.find(u => u._id === userId);
                if (user) {
                    const result = await addTeamMember(selectedTeam._id, user.email);
                    if (result) {
                        successCount++;
                    } else {
                        failedUsers.push(user.fullName || user.email);
                    }
                }
            } catch (error) {
                console.error('Failed to add user:', error);
                const user = allUsers.find(u => u._id === userId);
                failedUsers.push(user?.fullName || user?.email || 'Unknown user');
            }
        }

        if (successCount > 0) {
            toast.success(`Added ${successCount} member${successCount > 1 ? 's' : ''} successfully!`);
            if (failedUsers.length > 0) {
                toast.error(`Failed to add: ${failedUsers.join(', ')}`);
            }
            setShowAddMemberModal(false);
            await loadTeamDetails(selectedTeam._id);
            await fetchTeams();
        } else {
            toast.error('Failed to add members. Please try again.');
        }
        setIsLoading(false);
    };

    // Handle invite member by email
    const handleInviteMember = async (e) => {
        e.preventDefault();
        if (!selectedTeam || !inviteEmail) return;

        if (viewOnlyMode) {
            setError('You are in view-only mode. Cannot invite members.');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const result = await addTeamMember(selectedTeam._id, inviteEmail);
            if (result) {
                setInviteEmail('');
                setShowInviteModal(false);
                await loadTeamDetails(selectedTeam._id);
                await fetchTeams();
                toast.success('Member invited successfully!');
            }
        } catch (err) {
            console.error('Failed to invite member:', err);
            setError(err.response?.data?.message || 'Failed to invite member. Please try again.');
            toast.error('Failed to invite member');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle remove member
    const handleRemoveMember = async (memberId, memberName) => {
        if (!selectedTeam) return;
        
        if (viewOnlyMode) {
            setError('You are in view-only mode. Cannot remove members.');
            return;
        }
        
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const result = await removeTeamMember(selectedTeam._id, memberId);
            if (result) {
                await loadTeamDetails(selectedTeam._id);
                await fetchTeams();
                toast.success('Member removed successfully!');
            }
        } catch (err) {
            console.error('Failed to remove member:', err);
            setError(err.response?.data?.message || 'Failed to remove member. Please try again.');
            toast.error('Failed to remove member');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle team image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedTeam) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        if (viewOnlyMode) {
            setError('You are in view-only mode. Cannot update team image.');
            return;
        }

        setIsUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const result = await uploadTeamImage(selectedTeam._id, formData);
            if (result) {
                setTeamImage(result.image || result.url);
                await loadTeamDetails(selectedTeam._id);
                toast.success('Team image updated successfully!');
            }
        } catch (err) {
            console.error('Failed to upload image:', err);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Copy invite code to clipboard
    const copyInviteCode = () => {
        if (selectedTeam?.inviteCode) {
            navigator.clipboard.writeText(selectedTeam.inviteCode);
            toast.success('Invite code copied to clipboard!');
        }
    };

    // Copy team link
    const copyTeamLink = () => {
        if (selectedTeam?.inviteCode) {
            const link = `${window.location.origin}/join-team/${selectedTeam.inviteCode}`;
            navigator.clipboard.writeText(link);
            toast.success('Team link copied to clipboard!');
        }
    };

    // Handle leave team
    const handleLeaveTeam = async () => {
        if (!selectedTeam) return;
        
        if (viewOnlyMode) {
            setError('You are in view-only mode. Cannot leave the team.');
            return;
        }
        
        if (!window.confirm(`Are you sure you want to leave "${selectedTeam.name}"?`)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const result = await leaveTeam(selectedTeam._id);
            if (result) {
                setSelectedTeam(null);
                setSelectedTeamId(null);
                await fetchTeams();
                if (teams.length > 0) {
                    setSelectedTeamId(teams[0]._id);
                }
                toast.success('You have left the team successfully!');
            }
        } catch (err) {
            console.error('Failed to leave team:', err);
            setError(err.response?.data?.message || 'Failed to leave team. Please try again.');
            toast.error('Failed to leave team');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete team
    const handleDeleteTeam = async () => {
        if (!selectedTeam) return;
        
        if (viewOnlyMode) {
            setError('You are in view-only mode. Cannot delete the team.');
            return;
        }
        
        if (!window.confirm(`Are you sure you want to delete "${selectedTeam.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const result = await deleteTeam(selectedTeam._id);
            if (result) {
                setSelectedTeam(null);
                setSelectedTeamId(null);
                await fetchTeams();
                if (teams.length > 0) {
                    setSelectedTeamId(teams[0]._id);
                }
                toast.success('Team deleted successfully!');
            }
        } catch (err) {
            console.error('Failed to delete team:', err);
            setError(err.response?.data?.message || 'Failed to delete team. Please try again.');
            toast.error('Failed to delete team');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if current user is team admin
    const isTeamAdmin = () => {
        if (!selectedTeam || !authUser) return false;
        if (!selectedTeam.createdBy) return false;
        
        try {
            const adminId = selectedTeam.createdBy._id || selectedTeam.createdBy;
            const userId = authUser._id;
            return adminId.toString() === userId.toString();
        } catch (err) {
            console.error('Error checking admin status:', err);
            return false;
        }
    };

    // Get members with online status
    const getMembersWithStatus = () => {
        if (!selectedTeam) return [];
        return selectedTeam.members || [];
    };

    // Filter members by search
    const filteredMembers = getMembersWithStatus().filter(member => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const name = member.fullName || member.name || '';
        const email = member.email || '';
        return (
            name.toLowerCase().includes(search) ||
            email.toLowerCase().includes(search)
        );
    });

    // Filter users for add member modal
    const filteredUsers = allUsers.filter(user => {
        if (!userSearchTerm) return true;
        const search = userSearchTerm.toLowerCase();
        return (
            user.fullName?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        );
    });

    // Check if user is a member
    const isUserMember = selectedTeam ? checkIfUserIsMember(selectedTeam) : false;

    // Get team initials for avatar fallback
    const getTeamInitials = (name) => {
        if (!name) return 'T';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    // Loading state
    if (teamLoading && teams.length === 0) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-slate-500 dark:text-slate-400">Loading teams...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Not authenticated
    if (!authUser || !token) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                        <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
                        Please login to view your teams and collaborate with colleagues.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    // No teams state
    if (teams.length === 0 && !teamLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Building2 className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                        No Teams Yet
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4 text-center max-w-sm">
                        Create your first team or join an existing one to start collaborating.
                    </p>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowCreateTeamModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Team
                        </button>
                        <button 
                            onClick={() => setShowJoinModal(true)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            Join Team
                        </button>
                    </div>
                </div>
                {/* Join Team Modal */}
                <JoinTeamModal 
                    isOpen={showJoinModal}
                    onClose={() => {
                        setShowJoinModal(false);
                        setJoinError(null);
                        setJoinCode('');
                    }}
                    onSubmit={handleJoinTeam}
                    joinCode={joinCode}
                    setJoinCode={setJoinCode}
                    isJoining={isJoining}
                    error={joinError}
                    setError={setJoinError}
                />
                {/* Create Team Modal */}
                <CreateTeamModal
                    isOpen={showCreateTeamModal}
                    onClose={() => setShowCreateTeamModal(false)}
                    onCreateTeam={handleCreateTeam}
                    isCreating={isCreating}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Error Display */}
                {error && (
                    <div className={`rounded-lg p-4 flex items-start gap-3 ${
                        viewOnlyMode && !error.includes('Failed') 
                            ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20'
                            : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
                    }`}>
                        {viewOnlyMode ? (
                            <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className={viewOnlyMode ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                                {error}
                            </p>
                            <button 
                                onClick={() => setError(null)}
                                className="text-sm hover:underline mt-1"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* View-Only Mode Banner */}
                {viewOnlyMode && !error && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                        <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-amber-600 dark:text-amber-400">
                                You are viewing this team in read-only mode. You are not a member of this team.
                            </p>
                            <p className="text-sm text-amber-500 dark:text-amber-400/70 mt-1">
                                To collaborate, request to join the team or contact the team admin.
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Teams</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {teams.length} team{teams.length > 1 ? 's' : ''} • 
                            {selectedTeam && ` ${selectedTeam.members?.length || 0} members`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowJoinModal(true)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            Join Team
                        </button>
                        <button 
                            onClick={() => setShowCreateTeamModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Team
                        </button>
                    </div>
                </div>

                {/* Team Selector & Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {teams.map((team) => {
                            const isMember = checkIfUserIsMember(team);
                            const teamImg = team.image || null;
                            return (
                                <button
                                    key={team._id}
                                    onClick={() => handleTeamSelect(team._id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        selectedTeamId === team._id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    {teamImg ? (
                                        <img 
                                            src={teamImg} 
                                            alt={team.name} 
                                            className="w-5 h-5 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                            selectedTeamId === team._id
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                        }`}>
                                            {getTeamInitials(team.name)}
                                        </div>
                                    )}
                                    <span className="max-w-[120px] truncate">{team.name}</span>
                                    {!isMember && (
                                        <Eye className="w-3 h-3 text-slate-400" />
                                    )}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        selectedTeamId === team._id
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}>
                                        {team.members?.length || 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search members..."
                                className="w-full sm:w-48 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
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

                {/* Team Details & Members */}
                {selectedTeam && (
                    <>
                        {/* Team Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {/* Team Image with Upload */}
                                    <div className="relative group">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="team-image-upload"
                                        />
                                        {teamImage ? (
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                                                <img 
                                                    src={teamImage} 
                                                    alt={selectedTeam.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                                {!viewOnlyMode && isTeamAdmin() && (
                                                    <label
                                                        htmlFor="team-image-upload"
                                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    >
                                                        {isUploadingImage ? (
                                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                        ) : (
                                                            <Camera className="w-6 h-6 text-white" />
                                                        )}
                                                    </label>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl relative">
                                                {getTeamInitials(selectedTeam.name)}
                                                {!viewOnlyMode && isTeamAdmin() && (
                                                    <label
                                                        htmlFor="team-image-upload"
                                                        className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    >
                                                        {isUploadingImage ? (
                                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                        ) : (
                                                            <Upload className="w-5 h-5 text-white" />
                                                        )}
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            {selectedTeam.name}
                                            {!isUserMember && (
                                                <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                    View Only
                                                </span>
                                            )}
                                            {isTeamAdmin() && (
                                                <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                                    Admin
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {selectedTeam.description || 'No description'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {selectedTeam.members?.length === 1 ? `${selectedTeam.members?.length} member` : `${selectedTeam.members?.length || 0} members`}
                                            </span>
                                            {/* Only show invite code to admins */}
                                            {selectedTeam.inviteCode && isTeamAdmin() && (
                                                <>
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                                        Code: {selectedTeam.inviteCode}
                                                    </span>
                                                    <button 
                                                        onClick={copyInviteCode}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                        title="Copy invite code"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={copyTeamLink}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                        title="Copy invite link"
                                                    >
                                                        <Link2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!viewOnlyMode && isTeamAdmin() && (
                                        <>
                                            <button 
                                                onClick={openEditTeamModal}
                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit Team
                                            </button>
                                            <button 
                                                onClick={openAddMemberModal}
                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Add Members
                                            </button>
                                            <button 
                                                onClick={handleDeleteTeam}
                                                className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    {!viewOnlyMode && !isTeamAdmin() && isUserMember && (
                                        <button 
                                            onClick={handleLeaveTeam}
                                            className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1"
                                        >
                                            <UserX className="w-4 h-4" />
                                            Leave
                                        </button>
                                    )}
                                    {viewOnlyMode && isUserMember && (
                                        <button 
                                            onClick={handleLeaveTeam}
                                            className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1"
                                        >
                                            <UserX className="w-4 h-4" />
                                            Leave
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Team Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Members</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {selectedTeam.members?.length || 0}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Projects</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tasks</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Online</p>
                                <p className="text-2xl font-bold text-emerald-500">
                                    {selectedTeam.members?.filter(m => m.isOnline).length || 0}
                                </p>
                            </div>
                        </div>

                        {/* Members List */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Team Members
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                        ({filteredMembers.length})
                                    </span>
                                </h3>
                                {!viewOnlyMode && isTeamAdmin() && (
                                    <button 
                                        onClick={openAddMemberModal}
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add Members
                                    </button>
                                )}
                            </div>

                            {filteredMembers.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    <p>No members found</p>
                                    {searchTerm && (
                                        <p className="text-sm mt-1">Try adjusting your search</p>
                                    )}
                                </div>
                            ) : view === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    {filteredMembers.map((member) => {
                                        const memberId = member._id || member.user?._id || member;
                                        const memberName = member.fullName || member.name || 'Unknown';
                                        const memberEmail = member.email || '';
                                        const memberAvatar = member.avatar || member.profilePic || null;
                                        const isOnline = member.isOnline || false;
                                        const isCurrentUser = memberId.toString() === authUser?._id?.toString();
                                        const isAdmin = member.role === 'admin' || member.role === 'Admin';
                                        
                                        return (
                                            <div key={memberId} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            {memberAvatar ? (
                                                                <img 
                                                                    src={memberAvatar} 
                                                                    alt={memberName}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                                    {memberName.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                                                                isOnline ? 'bg-emerald-400' : 'bg-slate-400'
                                                            }`}></div>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-800 dark:text-white text-sm flex items-center gap-1">
                                                                {memberName}
                                                                {isCurrentUser && (
                                                                    <span className="text-xs text-indigo-500">(You)</span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {memberEmail}
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                {isAdmin && (
                                                                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                                {!isAdmin && (
                                                                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                                                                        Member
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!viewOnlyMode && isTeamAdmin() && !isCurrentUser && (
                                                        <button 
                                                            onClick={() => handleRemoveMember(memberId, memberName)}
                                                            className="text-red-400 hover:text-red-600 transition-colors"
                                                            title="Remove member"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                {!viewOnlyMode && isTeamAdmin() && (
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredMembers.map((member) => {
                                                const memberId = member._id || member.user?._id || member;
                                                const memberName = member.fullName || member.name || 'Unknown';
                                                const memberEmail = member.email || '';
                                                const memberAvatar = member.avatar || member.profilePicture || null;
                                                const isOnline = member.isOnline || false;
                                                const isCurrentUser = memberId.toString() === authUser?._id?.toString();
                                                const isAdmin = member.role === 'admin' || member.role === 'Admin';
                                                
                                                return (
                                                    <tr key={memberId} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                {memberAvatar ? (
                                                                    <img 
                                                                        src={memberAvatar} 
                                                                        alt={memberName}
                                                                        className="w-8 h-8 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                                                                        {memberName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <span className="font-medium text-slate-800 dark:text-white">
                                                                    {memberName}
                                                                    {isCurrentUser && (
                                                                        <span className="ml-1 text-xs text-indigo-500">(You)</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                            {memberEmail}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                isAdmin 
                                                                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                            }`}>
                                                                {isAdmin ? 'Admin' : 'Member'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${
                                                                    isOnline ? 'bg-emerald-400' : 'bg-slate-400'
                                                                }`}></div>
                                                                <span className="text-sm capitalize text-slate-600 dark:text-slate-300">
                                                                    {isOnline ? 'Online' : 'Offline'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {!viewOnlyMode && isTeamAdmin() && !isCurrentUser && (
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                <button 
                                                                    onClick={() => handleRemoveMember(memberId, memberName)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                // pages/Team.jsx - Add null checks around selectedTeam usage

{/* Team Files Section - Add this with proper null check */}
{selectedTeam && selectedTeam._id && (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <File className="w-5 h-5" />
                Team Files
            </h3>
            {!viewOnlyMode && isTeamAdmin() && selectedTeam && selectedTeam._id && (
                <TeamFiles 
                    teamId={selectedTeam._id} 
                    onFileUploaded={handleFileUploaded}
                />
            )}
        </div>
        <div className="p-4">
            {selectedTeam && selectedTeam._id && (
                <TeamFileList
                files={selectedTeam.files || []}
                teamId={selectedTeam._id}
                onFileDeleted={handleFileDeleted}
                isAdmin={isTeamAdmin()}
                />
            )}
        </div>
    </div>
)}

                {/* Add Members Modal */}
                {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
                            <div className="border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <UserPlus className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Add Team Members
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Select users to add to "{selectedTeam?.name}"
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddMemberModal(false);
                                        setSelectedUsers([]);
                                    }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto">
                                {/* Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        placeholder="Search users by name or email..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Bulk Actions */}
                                {filteredUsers.length > 0 && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <button
                                            onClick={selectAllUsers}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-slate-300 dark:text-slate-600">|</span>
                                        <button
                                            onClick={deselectAllUsers}
                                            className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
                                        >
                                            Deselect All
                                        </button>
                                        <span className="text-xs text-slate-400 ml-auto">
                                            {filteredUsers.length} users available
                                        </span>
                                    </div>
                                )}

                                {/* Selected count */}
                                {selectedUsers.length > 0 && (
                                    <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex items-center justify-between">
                                        <span className="text-sm text-indigo-600 dark:text-indigo-400">
                                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                                        </span>
                                        <button
                                            onClick={() => setSelectedUsers([])}
                                            className="text-sm text-red-500 hover:text-red-700"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}

                                {/* Users list */}
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                        <p>No users available to add</p>
                                        {userSearchTerm && (
                                            <p className="text-sm mt-1">Try adjusting your search</p>
                                        )}
                                        <p className="text-xs mt-2">All users are either already in the team or you</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {filteredUsers.map((user) => {
                                            const isSelected = selectedUsers.includes(user._id);
                                            const userInitials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
                                            
                                            return (
                                                <div
                                                    key={user._id}
                                                    onClick={() => toggleUserSelection(user._id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-2 border-indigo-500'
                                                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-transparent'
                                                    }`}
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        {user.profilePic ? (
                                                            <img
                                                                src={user.profilePic}
                                                                alt={user.fullName}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                                {userInitials}
                                                            </div>
                                                        )}
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                                                            {user.fullName}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {user.role || 'Member'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowAddMemberModal(false);
                                        setSelectedUsers([]);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSelectedUsers}
                                    disabled={selectedUsers.length === 0 || isLoading}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Team Modal */}
                {showEditTeamModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
                            {/* Header */}
                            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <Edit2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Edit Team
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Update team details and cover image
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEditTeamModal(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateTeam} className="p-6 space-y-5">
                                {/* Cover Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Cover Image
                                    </label>
                                    <div className="relative">
                                        {editTeamData.coverPreview ? (
                                            <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                                <img 
                                                    src={editTeamData.coverPreview} 
                                                    alt="Team cover" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeCoverImage}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <label
                                                    htmlFor="cover-image-upload"
                                                    className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors cursor-pointer"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                    <input
                                                        ref={coverInputRef}
                                                        id="cover-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleCoverImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="cover-image-upload"
                                                className="w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                            >
                                                <Camera className="w-8 h-8 text-slate-400" />
                                                <span className="text-sm text-slate-500 dark:text-slate-400 mt-2">Upload Cover Image</span>
                                                <span className="text-xs text-slate-400">JPEG, PNG, GIF or WebP (max 5MB)</span>
                                                <input
                                                    ref={coverInputRef}
                                                    id="cover-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCoverImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Team Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Team Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={editTeamData.name}
                                            onChange={(e) => setEditTeamData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-white"
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Description
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <textarea
                                            value={editTeamData.description}
                                            onChange={(e) => setEditTeamData(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-white resize-none"
                                            maxLength={500}
                                        />
                                    </div>
                                </div>

                                {/* Privacy Setting */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Privacy
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditTeamData(prev => ({ ...prev, isPrivate: true }))}
                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                                editTeamData.isPrivate
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <Lock className={`w-5 h-5 ${editTeamData.isPrivate ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-slate-800 dark:text-white">Private</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Only invited members</p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditTeamData(prev => ({ ...prev, isPrivate: false }))}
                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                                !editTeamData.isPrivate
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <Globe className={`w-5 h-5 ${!editTeamData.isPrivate ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-slate-800 dark:text-white">Public</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Visible to everyone</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditTeamModal(false)}
                                        className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingTeam || !editTeamData.name.trim()}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUpdatingTeam ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update Team
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Invite Modal - Keep for email invite */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    Invite Team Member
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowInviteModal(false);
                                        setInviteEmail('');
                                        setError(null);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <form onSubmit={handleInviteMember}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        The user will receive an invitation to join the team.
                                    </p>
                                </div>
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowInviteModal(false);
                                            setInviteEmail('');
                                            setError(null);
                                        }}
                                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !inviteEmail.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4" />
                                                Send Invite
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join Team Modal */}
                <JoinTeamModal 
                    isOpen={showJoinModal}
                    onClose={() => {
                        setShowJoinModal(false);
                        setJoinError(null);
                        setJoinCode('');
                    }}
                    onSubmit={handleJoinTeam}
                    joinCode={joinCode}
                    setJoinCode={setJoinCode}
                    isJoining={isJoining}
                    error={joinError}
                    setError={setJoinError}
                />

                {/* Create Team Modal */}
                <CreateTeamModal
                    isOpen={showCreateTeamModal}
                    onClose={() => setShowCreateTeamModal(false)}
                    onCreateTeam={handleCreateTeam}
                    isCreating={isCreating}
                />
            </div>
        </DashboardLayout>
    );
};

// Join Team Modal Component
const JoinTeamModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    joinCode, 
    setJoinCode, 
    isJoining, 
    error, 
    setError 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                Join Team
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Enter the invite code to join
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
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Invite Code
                        </label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => {
                                    setJoinCode(e.target.value.toUpperCase());
                                    setError(null);
                                }}
                                placeholder="Enter invite code (e.g., ABC123)"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-mono tracking-widest text-center uppercase"
                                maxLength={20}
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                            Ask your team admin for the invite code
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

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
                            disabled={isJoining || !joinCode.trim()}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Join Team
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Team;