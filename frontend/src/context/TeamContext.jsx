// context/TeamContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const [teams, setTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [unseenMessages, setUnseenMessages] = useState({});

    // Get auth context
    const { authUser, token, socket } = useContext(AuthContext);

    // Set axios auth header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    // ===== FETCH ALL USER TEAMS =====
    const fetchTeams = async () => {
        if (!token) {
            console.log('No token found, skipping team fetch');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.get('/api/teams');
            if (data.success) {
                setTeams(data.teams || []);
                console.log('Teams fetched:', data.teams);
                return data.teams;
            }
        } catch (error) {
            console.error('Fetch teams error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch teams';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ===== GET SINGLE TEAM BY ID =====
    const getTeamById = async (teamId) => {
        if (!token || !teamId) return null;

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.get(`/api/teams/${teamId}`);
            if (data.success) {
                setCurrentTeam(data.team);
                setTeamMembers(data.team.members || []);
                
                // Join team room for real-time updates
                if (socket) {
                    socket.emit('joinTeamRoom', teamId);
                }
                
                return data.team;
            }
        } catch (error) {
            console.error('Get team error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to get team';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };


    // ===== CREATE TEAM =====
    const createTeam = async (teamData) => {
        if (!token) {
            toast.error('Please login to create a team');
            return null;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.post('/api/teams', teamData);
            if (data.success) {
                // Add new team to state
                setTeams(prev => [data.team, ...prev]);
                setCurrentTeam(data.team);
                toast.success(data.message || 'Team created successfully!');
                
                // Join team room
                if (socket && data.team._id) {
                    socket.emit('joinTeamRoom', data.team._id);
                }
                
                return data.team;
            }
        } catch (error) {
            console.error('Create team error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to create team';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ===== UPDATE TEAM =====
    const updateTeam = async (teamId, updateData) => {
        if (!token || !teamId) {
            toast.error('Invalid request');
            return null;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.put(`/api/teams/${teamId}`, updateData, {
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'  // ✅ Add this line
            }
            });
            if (data.success) {
                // Update team in state
                setTeams(prev => 
                    prev.map(team => 
                        team._id === teamId ? data.team : team
                    )
                );
                setCurrentTeam(data.team);
                toast.success(data.message || 'Team updated successfully!');
                return {success: true, team: data.team};
            }
        } catch (error) {
            console.error('Update team error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update team';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ===== DELETE TEAM =====
    const deleteTeam = async (teamId) => {
        if (!token || !teamId) {
            toast.error('Invalid request');
            return false;
        }

        if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            return false;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.delete(`/api/teams/${teamId}`);
            if (data.success) {
                // Remove team from state
                setTeams(prev => prev.filter(team => team._id !== teamId));
                if (currentTeam?._id === teamId) {
                    setCurrentTeam(null);
                    setTeamMembers([]);
                }
                toast.success(data.message || 'Team deleted successfully!');
                
                // Leave team room
                if (socket) {
                    socket.emit('leaveTeamRoom', teamId);
                }
                
                return true;
            }
        } catch (error) {
            console.error('Delete team error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to delete team';
            setError(errorMsg);
            toast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ===== ADD MEMBER TO TEAM =====
    const addTeamMember = async (teamId, email) => {
        if (!token || !teamId || !email) {
            toast.error('Email is required');
            return null;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.put(`/api/teams/${teamId}/member`, { email });
            if (data.success) {
                // Update team in state
                setTeams(prev => 
                    prev.map(team => 
                        team._id === teamId ? data.team : team
                    )
                );
                setCurrentTeam(data.team);
                setTeamMembers(data.team.members || []);
                toast.success(data.message || 'Member added successfully!');
                return data.team;
            }
        } catch (error) {
            console.error('Add member error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to add member';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ===== REMOVE MEMBER FROM TEAM =====
    const removeTeamMember = async (teamId, memberId) => {
        if (!token || !teamId || !memberId) {
            toast.error('Invalid request');
            return false;
        }

        if (!window.confirm('Are you sure you want to remove this member?')) {
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.delete(`/api/teams/${teamId}/member/${memberId}`);
            if (data.success) {
                // Update team in state
                setTeams(prev => 
                    prev.map(team => 
                        team._id === teamId ? data.team : team
                    )
                );
                setCurrentTeam(data.team);
                setTeamMembers(data.team.members || []);
                toast.success(data.message || 'Member removed successfully!');
                return true;
            }
        } catch (error) {
            console.error('Remove member error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to remove member';
            setError(errorMsg);
            toast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ===== LEAVE TEAM =====
    const leaveTeam = async (teamId) => {
        if (!token || !teamId) {
            toast.error('Invalid request');
            return false;
        }

        if (!window.confirm('Are you sure you want to leave this team?')) {
            return false;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.post(`/api/teams/${teamId}/leave`);
            if (data.success) {
                // Remove team from state
                setTeams(prev => prev.filter(team => team._id !== teamId));
                if (currentTeam?._id === teamId) {
                    setCurrentTeam(null);
                    setTeamMembers([]);
                }
                toast.success(data.message || 'You have left the team successfully!');
                
                // Leave team room
                if (socket) {
                    socket.emit('leaveTeamRoom', teamId);
                }
                
                return true;
            }
        } catch (error) {
            console.error('Leave team error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to leave team';
            setError(errorMsg);
            toast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ===== GENERATE INVITE CODE =====
    const generateInviteCode = async (teamId) => {
        if (!token || !teamId) {
            toast.error('Invalid request');
            return null;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.post(`/api/teams/${teamId}/invite`);
            if (data.success) {
                toast.success('New invite code generated!');
                return data.inviteCode;
            }
        } catch (error) {
            console.error('Generate invite code error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to generate invite code';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ===== JOIN TEAM BY INVITE CODE =====
    const joinTeamByInvite = async (inviteCode) => {
        if (!token || !inviteCode) {
            toast.error('Invalid invite code');
            return null;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { data } = await axios.put(`/api/teams/${inviteCode}/member/invite`);
            if (data.success) {
                // Add team to state
                setTeams(prev => [data.team, ...prev]);
                setCurrentTeam(data.team);
                toast.success(data.message || 'Successfully joined the team!');
                
                // Join team room
                if (socket && data.team._id) {
                    socket.emit('joinTeamRoom', data.team._id);
                }
                
                return data.team;
            }
        } catch (error) {
            console.error('Join team error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to join team';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ===== SOCKET EVENT LISTENERS =====
    useEffect(() => {
        if (!socket) return;

        // Listen for team updates
        socket.on('teamUpdated', (data) => {
            console.log('Team updated:', data);
            // Update team in state
            setTeams(prev => 
                prev.map(team => 
                    team._id === data.teamId ? data.team : team
                )
            );
            if (currentTeam?._id === data.teamId) {
                setCurrentTeam(data.team);
            }
            toast.success(data.message);
        });

        // Listen for member added
        socket.on('memberAdded', (data) => {
            console.log('Member added:', data);
            setTeams(prev => 
                prev.map(team => 
                    team._id === data.teamId ? data.team : team
                )
            );
            if (currentTeam?._id === data.teamId) {
                setCurrentTeam(data.team);
                setTeamMembers(data.team.members || []);
            }
            toast.success(data.message);
        });

        // Listen for member removed
        socket.on('memberRemoved', (data) => {
            console.log('Member removed:', data);
            setTeams(prev => 
                prev.map(team => 
                    team._id === data.teamId ? data.team : team
                )
            );
            if (currentTeam?._id === data.teamId) {
                setCurrentTeam(data.team);
                setTeamMembers(data.team.members || []);
            }
            toast.info(data.message);
        });

        // Listen for member left
        socket.on('memberLeft', (data) => {
            console.log('Member left:', data);
            // Refresh teams
            fetchTeams();
        });

        // Listen for team deleted
        socket.on('teamDeleted', (data) => {
            console.log('Team deleted:', data);
            setTeams(prev => prev.filter(team => team._id !== data.teamId));
            if (currentTeam?._id === data.teamId) {
                setCurrentTeam(null);
                setTeamMembers([]);
            }
            toast.error(data.message);
        });

        // Cleanup listeners
        return () => {
            socket.off('teamUpdated');
            socket.off('memberAdded');
            socket.off('memberRemoved');
            socket.off('memberLeft');
            socket.off('teamDeleted');
        };
    }, [socket, currentTeam]);

    // ===== AUTO-FETCH TEAMS ON MOUNT AND USER CHANGE =====
    useEffect(() => {
        if (authUser && token) {
            fetchTeams();
        } else {
            setTeams([]);
            setCurrentTeam(null);
            setTeamMembers([]);
        }
    }, [authUser, token]);

    // ===== CLEAR TEAM DATA ON LOGOUT =====
    useEffect(() => {
        if (!authUser) {
            setTeams([]);
            setCurrentTeam(null);
            setTeamMembers([]);
            setUnseenMessages({});
        }
    }, [authUser]);

    // ===== CONTEXT VALUE =====
    const value = {
        // State
        teams,
        setTeams,
        currentTeam,
        setCurrentTeam,
        teamMembers,
        setTeamMembers,
        loading,
        error,
        unseenMessages,
        setUnseenMessages,

        // Team CRUD Operations
        fetchTeams,
        getTeamById,
        createTeam,
        updateTeam,
        deleteTeam,

        // Member Management
        addTeamMember,
        removeTeamMember,
        leaveTeam,

        // Invite System
        generateInviteCode,
        joinTeamByInvite,

        // Utilities
        isTeamAdmin: (team) => {
            if (!team || !authUser) return false;
            return team.createdBy?._id?.toString() === authUser._id?.toString();
        },
        isTeamMember: (team) => {
            if (!team || !authUser) return false;
            return team.members?.some(m => m._id?.toString() === authUser._id?.toString());
        },
        getMemberCount: (team) => {
            return team?.members?.length || 0;
        }
    };

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};