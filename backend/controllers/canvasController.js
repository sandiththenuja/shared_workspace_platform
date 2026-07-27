// controllers/canvasController.js
import Canvas from "../models/Canvas.js";
import Team from "../models/Team.js";
import { io, userSocketMap } from "../server.js";

// ===== HELPER FUNCTIONS =====

const isTeamMember = (team, userId) => {
    if (!team || !userId) return false;
    if (!team.members || !Array.isArray(team.members)) return false;
    return team.members.some(member => {
        const memberId = member._id || member;
        return memberId.toString() === userId.toString();
    });
};

const isTeamAdmin = (team, userId) => {
    if (!team || !userId) return false;
    if (!team.createdBy) return false;
    try {
        const creatorId = team.createdBy._id || team.createdBy;
        return creatorId.toString() === userId.toString();
    } catch (error) {
        return false;
    }
};

// ===== CREATE CANVAS =====
export const createCanvas = async (req, res) => {
    try {
        const { name, description, teamId, isPublic, tags } = req.body;
        const userId = req.user._id;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Canvas name is required'
            });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        const isMember = isTeamMember(team, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        const canvas = await Canvas.create({
            name: name.trim(),
            description: description || '',
            teamId,
            createdBy: userId,
            isPublic: isPublic || false,
            tags: tags || []
        });

        const populatedCanvas = await Canvas.findById(canvas._id)
            .populate('createdBy', 'fullName email profilePic')
            .populate('collaborators.user', 'fullName email profilePic');

        // Notify team members
        team.members.forEach(memberId => {
            const socketId = userSocketMap[memberId.toString()];
            if (socketId && memberId.toString() !== userId.toString()) {
                io.to(socketId).emit('canvasCreated', {
                    canvas: populatedCanvas,
                    teamId: teamId,
                    message: `${req.user.fullName} created a new canvas: ${name}`
                });
            }
        });

        res.status(201).json({
            success: true,
            canvas: populatedCanvas,
            message: 'Canvas created successfully'
        });

    } catch (error) {
        console.error('Create canvas error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create canvas'
        });
    }
};

// ===== GET TEAM CANVASES =====
export const getTeamCanvases = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        const isMember = isTeamMember(team, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        const canvases = await Canvas.find({ teamId })
            .populate('createdBy', 'fullName email profilePic')
            .populate('collaborators.user', 'fullName email profilePic')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            canvases,
            count: canvases.length
        });

    } catch (error) {
        console.error('Get canvases error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get canvases'
        });
    }
};

// ===== GET CANVAS BY ID =====
export const getCanvasById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const canvas = await Canvas.findById(id)
            .populate('createdBy', 'fullName email profilePic')
            .populate('collaborators.user', 'fullName email profilePic');

        if (!canvas) {
            return res.status(404).json({
                success: false,
                message: 'Canvas not found'
            });
        }

        const team = await Team.findById(canvas.teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        const isMember = isTeamMember(team, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this canvas'
            });
        }

        canvas.lastActive = new Date();
        await canvas.save();

        res.json({
            success: true,
            canvas
        });

    } catch (error) {
        console.error('Get canvas error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get canvas'
        });
    }
};

// ===== UPDATE CANVAS =====
export const updateCanvas = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isPublic, tags, drawingData, background, canvasSize } = req.body;
        const userId = req.user._id;

        const canvas = await Canvas.findById(id);
        if (!canvas) {
            return res.status(404).json({
                success: false,
                message: 'Canvas not found'
            });
        }

        const isCreator = canvas.createdBy.toString() === userId.toString();
        const isCollaborator = canvas.collaborators.some(
            c => c.user.toString() === userId.toString() && c.role === 'editor'
        );

        if (!isCreator && !isCollaborator) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to edit this canvas'
            });
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (tags) updateData.tags = tags;
        if (drawingData) updateData.drawingData = drawingData;
        if (background) updateData.background = background;
        if (canvasSize) updateData.canvasSize = canvasSize;

        const updatedCanvas = await Canvas.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('createdBy', 'fullName email profilePic')
        .populate('collaborators.user', 'fullName email profilePic');

        const team = await Team.findById(canvas.teamId);
        if (team) {
            team.members.forEach(memberId => {
                const socketId = userSocketMap[memberId.toString()];
                if (socketId) {
                    io.to(socketId).emit('canvasUpdated', {
                        canvasId: id,
                        canvas: updatedCanvas,
                        updatedBy: req.user.fullName
                    });
                }
            });
        }

        res.json({
            success: true,
            canvas: updatedCanvas,
            message: 'Canvas updated successfully'
        });

    } catch (error) {
        console.error('Update canvas error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update canvas'
        });
    }
};

// ===== DELETE CANVAS =====
export const deleteCanvas = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const canvas = await Canvas.findById(id);
        if (!canvas) {
            return res.status(404).json({
                success: false,
                message: 'Canvas not found'
            });
        }

        if (canvas.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can delete this canvas'
            });
        }

        const team = await Team.findById(canvas.teamId);
        await Canvas.findByIdAndDelete(id);

        if (team) {
            team.members.forEach(memberId => {
                const socketId = userSocketMap[memberId.toString()];
                if (socketId) {
                    io.to(socketId).emit('canvasDeleted', {
                        canvasId: id,
                        name: canvas.name,
                        deletedBy: req.user.fullName
                    });
                }
            });
        }

        res.json({
            success: true,
            message: 'Canvas deleted successfully'
        });

    } catch (error) {
        console.error('Delete canvas error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete canvas'
        });
    }
};

// ===== ADD COLLABORATOR =====
export const addCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;
        const userId = req.user._id;

        const canvas = await Canvas.findById(id);
        if (!canvas) {
            return res.status(404).json({
                success: false,
                message: 'Canvas not found'
            });
        }

        if (canvas.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can add collaborators'
            });
        }

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (canvas.collaborators.some(c => c.user.toString() === userToAdd._id.toString())) {
            return res.status(400).json({
                success: false,
                message: 'User is already a collaborator'
            });
        }

        canvas.collaborators.push({
            user: userToAdd._id,
            role: role || 'viewer'
        });
        await canvas.save();

        const updatedCanvas = await Canvas.findById(id)
            .populate('createdBy', 'fullName email profilePic')
            .populate('collaborators.user', 'fullName email profilePic');

        const socketId = userSocketMap[userToAdd._id];
        if (socketId) {
            io.to(socketId).emit('addedToCanvas', {
                canvasId: id,
                canvas: updatedCanvas,
                addedBy: req.user.fullName
            });
        }

        res.json({
            success: true,
            canvas: updatedCanvas,
            message: 'Collaborator added successfully'
        });

    } catch (error) {
        console.error('Add collaborator error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add collaborator'
        });
    }
};

// ===== REMOVE COLLABORATOR =====
export const removeCollaborator = async (req, res) => {
    try {
        const { id, collaboratorId } = req.params;
        const userId = req.user._id;

        const canvas = await Canvas.findById(id);
        if (!canvas) {
            return res.status(404).json({
                success: false,
                message: 'Canvas not found'
            });
        }

        if (canvas.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can remove collaborators'
            });
        }

        canvas.collaborators = canvas.collaborators.filter(
            c => c.user.toString() !== collaboratorId
        );
        await canvas.save();

        const updatedCanvas = await Canvas.findById(id)
            .populate('createdBy', 'fullName email profilePic')
            .populate('collaborators.user', 'fullName email profilePic');

        const socketId = userSocketMap[collaboratorId];
        if (socketId) {
            io.to(socketId).emit('removedFromCanvas', {
                canvasId: id,
                removedBy: req.user.fullName
            });
        }

        res.json({
            success: true,
            canvas: updatedCanvas,
            message: 'Collaborator removed successfully'
        });

    } catch (error) {
        console.error('Remove collaborator error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to remove collaborator'
        });
    }
};