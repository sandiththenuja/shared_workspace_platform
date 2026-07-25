import Team from "../models/Team.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

const isTeamAdmin = (team, userId) => {
    return team.createdBy.toString() === userId.toString();
};

const isTeamMember = (team, userId) => {
    // return team.members(memberId => 
    //     memberId.toString() === userId.toString()
    // );
    return team.members.includes(userId)
};

export const createTeam = async (req, res) => {
    try {
        const { name, description, members, inviteCode, isPrivate } = req.body;

        const userId = req.user._id

        const duplicate = await Team.findOne({inviteCode})
        if(duplicate){
            return res.status(400).json({success: false, message: "Invite code already exists"})
        }

        // Validate required fields
        if (!name || name.trim().length === 0) {
            return res.status(400).json({success: false,message: 'Team name is required'});
        }

        // Create team
        const team = await Team.create({
            name,
            description,
            createdBy: userId,
            members,
            inviteCode,
            isPrivate
        });

        await User.findByIdAndUpdate(userId, { 
            team: team._id,
            role: 'admin'
        });

        const populatedTeam = await Team.findById(team._id)
            .populate('members.user', 'name email profilePic')
            .populate('createdBy', 'name email profilePic')
            .populate('members.invitedBy', 'name email');

        const socketId = userSocketMap[createdBy];
        if (socketId) {
            io.to(socketId).emit('teamCreated', {
                team: populatedTeam,
                message: `You created team "${team.name}"`
            });
        }

        res.status(201).json({
            success: true,
            team,
            populatedTeam,
            message: 'Team created successfully',
        });

    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create team'
        });
    }
}

export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        if (!isTeamAdmin(team, userId)) {
            return res.status(403).json({
                success: false,
                message: 'Only the team creator can update team details'
            });
        }

        const allowedUpdates = ['name', 'description', 'coverImage', 'inviteCode', 'isPrivate'];
        const updateData = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = updates[key];
            }
        });

        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('members.user', 'name email profilePic status')
        .populate('createdBy', 'name email profilePic')
        .populate('members.invitedBy', 'name email');

        // Notify all team members
        team.members.forEach(member => {
            const socketId = userSocketMap[member.user];
            if (socketId) {
                io.to(socketId).emit('teamUpdated', {
                    teamId: id,
                    team: updatedTeam,
                    message: `Team "${updatedTeam.name}" has been updated`
                });
            }
        });

        res.json({
            success: true,
            team: updatedTeam,
            message: 'Team updated successfully'
        });

    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update team'
        });
    }
};

export const addTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userId = req.user._id;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is admin/creator using helper
        if (!isTeamAdmin(team, userId)) {
            return res.status(403).json({
                success: false,
                message: 'Only the team creator can add members'
            });
        }

        // Find user by email
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Check if already in team
        if (isTeamMember(team, userToAdd._id)) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this team'
            });
        }

        // Add member
        team.members.push(userToAdd._id);
        await team.save();

        // Update user's team reference
        await User.findByIdAndUpdate(userToAdd._id, { team: team._id });

        // Populate team
        const populatedTeam = await Team.findById(team._id)
            .populate('members', 'name email profilePic')
            .populate('createdBy', 'name email profilePic');

        // Notify all members
        team.members.forEach(memberId => {
            const socketId = userSocketMap[memberId.toString()];
            if (socketId) {
                io.to(socketId).emit('memberAdded', {
                    teamId: team._id,
                    team: populatedTeam,
                    newMember: {
                        _id: userToAdd._id,
                        fullName: userToAdd.fullName,
                        email: userToAdd.email,
                        profilePic: userToAdd.profilePic
                    },
                    message: `${userToAdd.fullName} joined the team`,
                    timestamp: new Date().toISOString()
                });
            }
        });

        res.json({
            success: true,
            team: populatedTeam,
            message: 'Member added successfully'
        });

    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add member'
        });
    }
};

export const removeTeamMember = async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const userId = req.user._id;

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is admin/creator using helper
        if (!isTeamAdmin(team, userId)) {
            return res.status(403).json({
                success: false,
                message: 'Only the team creator can remove members'
            });
        }

        // Cannot remove self
        if (memberId === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot remove yourself from the team'
            });
        }

        const memberToRemove = await User.findById(memberId).select('name email');
        
        if (!memberToRemove) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get member details before removal
        const updatedMembers = team.members.filter(member => {
            // 'member' is the current item in the array
            // 'memberId' is the ID we want to remove
            return member.toString() !== memberId.toString();
        });
        
        team.members = updatedMembers;

        await team.save();

        // Remove team from user
        await User.findByIdAndUpdate(memberId, { $unset: { team: "" } });

        // Populate team
        const populatedTeam = await Team.findById(team._id)
            .populate('members', 'name email profilePic')
            .populate('createdBy', 'name email profilePic');

        // Log for debugging
        console.log('Member removed successfully:', {
            teamId: team._id,
            teamName: team.name,
            removedMember: memberToRemove.fullName,
            remainingMembers: team.members.length
        });

        // Notify all remaining members
        team.members.forEach(member => {
            const socketId = userSocketMap[member.toString()];
            if (socketId) {
                io.to(socketId).emit('memberRemoved', {
                    teamId: team._id,
                    team: populatedTeam,
                    removedMember: {
                        _id: memberId,
                        fullName: memberToRemove.fullName || 'Unknown',
                        email: memberToRemove.email
                    },
                    message: `${memberToRemove.fullName || 'A member'} was removed from the team`,
                    timestamp: new Date().toISOString()
                });
            }
        });

         // Notify the removed member
        const removedSocketId = userSocketMap[memberId];
        if (removedSocketId) {
            io.to(removedSocketId).emit('removedFromTeam', {
                teamId: team._id,
                teamName: team.name,
                message: `You have been removed from team "${team.name}"`,
                removedBy: req.user.fullName,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            team: populatedTeam,
            removedMember: {
                _id: memberId,
                fullName: memberToRemove.fullName,
                email: memberToRemove.email
            },
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to remove member'
        });
    }
};

export const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is admin/creator using helper
        if (!isTeamAdmin(team, userId)) {
            return res.status(403).json({
                success: false,
                message: 'Only the team creator can delete the team'
            });
        }

        // Get all member IDs for notification
        const memberIds = team.members;

        // Remove team reference from all members
        await User.updateMany(
            { _id: { $in: memberIds } },
            { $unset: { team: "" } }
        );

        // Delete team
        await Team.findByIdAndDelete(id);

        // Notify all members
        memberIds.forEach(memberId => {
            const socketId = userSocketMap[memberId.toString()];
            if (socketId) {
                io.to(socketId).emit('teamDeleted', {
                    teamId: id,
                    teamName: team.name,
                    message: `Team "${team.name}" has been deleted`,
                    deletedBy: req.user.fullName,
                    timestamp: new Date().toISOString()
                });
            }
        });

        res.json({
            success: true,
            message: 'Team deleted successfully'
        });

    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete team'
        });
    }
};

export const getUserTeams = async (req, res) => {
    try {
        const userId = req.user._id;

        const teams = await Team.find({
            $or: [
                { createdBy: userId },
                { members: userId }
            ]
        })
        .populate('members', 'name email profilePic')
        .populate('createdBy', 'name email profilePic')
        .sort({ createdAt: -1 });

        // Add admin status to each team
        const teamsWithAdminStatus = teams.map(team => ({
            ...team.toObject(),
            isAdmin: team.createdBy._id.toString() === userId.toString()
        }));

        res.json({
            success: true,
            teams: teamsWithAdminStatus,
            count: teams.length
        });

    } catch (error) {
        console.error('Get user teams error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get teams'
        });
    }
};

export const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const team = await Team.findById(id)
            .populate('members', 'name email profilePic')
            .populate('createdBy', 'name email profilePic');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is a member or creator
        const isMember = isTeamMember(team, userId) || isTeamAdmin(team, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        // Add admin status to response
        const teamObj = team.toObject();
        teamObj.isAdmin = isTeamAdmin(team, userId);

        res.json({
            success: true,
            team: teamObj
        });

    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get team'
        });
    }
};

// ===== LEAVE TEAM =====
export const leaveTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is a member
        if (!isTeamMember(team, userId)) {
            return res.status(404).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        // Check if user is the creator/admin
        if (isTeamAdmin(team, userId)) {
            return res.status(400).json({
                success: false,
                message: 'The team creator cannot leave. Either delete the team or assign a new creator'
            });
        }

        // Remove member
        team.members = team.members.filter(memberId => 
            memberId.toString() !== userId.toString()
        );
        await team.save();

        // Remove team from user
        await User.findByIdAndUpdate(userId, { $unset: { team: "" } });

        // Notify remaining members
        team.members.forEach(memberId => {
            const socketId = userSocketMap[memberId.toString()];
            if (socketId) {
                io.to(socketId).emit('memberLeft', {
                    teamId: team._id,
                    userId: userId,
                    message: `${req.user.fullName} left the team`
                });
            }
        });

        res.json({
            success: true,
            message: 'You have left the team successfully'
        });

    } catch (error) {
        console.error('Leave team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to leave team'
        });
    }
};

// ===== GENERATE NEW INVITE CODE =====
export const generateInviteCode = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is admin/creator
        if (!isTeamAdmin(team, userId)) {
            return res.status(403).json({
                success: false,
                message: 'Only the team creator can generate invite codes'
            });
        }

        // Generate new invite code
        const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        team.inviteCode = newInviteCode;
        await team.save();

        res.json({
            success: true,
            inviteCode: newInviteCode,
            message: 'New invite code generated successfully'
        });

    } catch (error) {
        console.error('Generate invite code error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate invite code'
        });
    }
};

// ===== JOIN TEAM BY INVITE CODE =====
export const joinTeamByInvite = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user._id;

        const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        // Check if already a member
        if (isTeamMember(team, userId) || isTeamAdmin(team, userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this team'
            });
        }

        // Add member
        team.members.push(userId);
        await team.save();

        // Update user's team reference
        await User.findByIdAndUpdate(userId, { team: team._id });

        // Populate team
        const populatedTeam = await Team.findById(team._id)
            .populate('members', 'fullName email profilePic status')
            .populate('createdBy', 'fullName email profilePic');

        // Notify all members
        team.members.forEach(memberId => {
            const socketId = userSocketMap[memberId.toString()];
            if (socketId) {
                io.to(socketId).emit('memberAdded', {
                    teamId: team._id,
                    team: populatedTeam,
                    newMember: req.user,
                    message: `${req.user.fullName} joined the team via invite`
                });
            }
        });

        res.json({
            success: true,
            team: populatedTeam,
            message: 'Successfully joined the team'
        });

    } catch (error) {
        console.error('Join team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to join team'
        });
    }
};
