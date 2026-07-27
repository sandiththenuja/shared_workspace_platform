import Team from "../models/Team.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose";
import cloudinary from '../lib/cloudinary.js';

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

        const socketId = userSocketMap[userId];
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

// export const updateTeam = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user._id;
//         const {name, description, isPrivate, coverImg, files, fileNames, fileDescriptions } = req.body;

//         const team = await Team.findById(id);
//         if (!team) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Team not found'
//             });
//         }

//         if (!isTeamAdmin(team, userId)) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Only the team creator can update team details'
//             });
//         }

//         let updateData = {
//             name: name || team.name,
//             description: description !== undefined ? description : team.description,
//             isPrivate: isPrivate !== undefined ? isPrivate : team.isPrivate
//         };

//         if (coverImg) {
//             // Check if it's a base64 image
//             if (coverImg.startsWith('data:image')) {
//                 // Upload to Cloudinary
//                 const uploadResponse = await cloudinary.uploader.upload(coverImg, {
//                     folder: 'team_cover_images',
//                     transformation: [
//                         { width: 1200, height: 400, crop: 'fill' },
//                         { quality: 'auto' },
//                         { fetch_format: 'auto' }
//                     ]
//                 });
//                 updateData.coverImg = uploadResponse.secure_url;
//             } else {
//                 // If it's already a URL, use it directly
//                 updateData.coverImg = coverImg;
//             }
//         }
// // 2. Handle multiple files (base64 array)
//         if (files && Array.isArray(files) && files.length > 0) {
//             // Initialize files array if it doesn't exist
//             if (!team.files) {
//                 team.files = [];
//             }

//             // Process each file
//             for (let i = 0; i < files.length; i++) {
//                 const fileData = files[i];
//                 const fileName = fileNames && fileNames[i] ? fileNames[i] : `File ${i + 1}`;
//                 const fileDescription = fileDescriptions && fileDescriptions[i] ? fileDescriptions[i] : '';

//                 // Skip if file data is not valid
//                 if (!fileData || !fileData.startsWith('data:')) {
//                     console.log(`Skipping invalid file data at index ${i}`);
//                     continue;
//                 }

//                 try {
//                     // Extract mime type from base64
//                     const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,/);
//                     const mimeType = matches ? matches[1] : 'application/octet-stream';
                    
//                     // Determine resource type for Cloudinary
//                     let resourceType = 'auto';
//                     if (mimeType.startsWith('image/')) {
//                         resourceType = 'image';
//                     } else if (mimeType.startsWith('video/')) {
//                         resourceType = 'video';
//                     } else {
//                         resourceType = 'raw';
//                     }

//                     // Upload to Cloudinary
//                     const uploadOptions = {
//                         folder: `team_files/${id}`,
//                         resource_type: resourceType,
//                         public_id: `${Date.now()}-${fileName.split('.')[0].replace(/\s/g, '_')}`,
//                         use_filename: true,
//                         unique_filename: true,
//                     };

//                     // Handle PDF specifically
//                     if (mimeType === 'application/pdf') {
//                         uploadOptions.format = 'pdf';
//                         uploadOptions.resource_type = 'raw';
//                     }

//                     const result = await cloudinary.uploader.upload(fileData, uploadOptions);

//                     // Create file object matching the schema
//                     const fileObject = {
//                         name: fileName,
//                         url: result.secure_url,
//                         fileSize: result.bytes || 0,
//                         fileType: mimeType,
//                         publicId: result.public_id,
//                         uploadedBy: userId,
//                         uploadedAt: new Date(),
//                         description: fileDescription
//                     };

//                     // Check if file already exists (prevent duplicates)
//                     const existingFile = team.files.find(f => f.url === result.secure_url);
//                     if (!existingFile) {
//                         team.files.push(fileObject);
//                     }
//                 } catch (uploadError) {
//                     console.error(`Error uploading file ${fileName}:`, uploadError);
//                     // Continue with next file
//                 }
//             }
//         }

//         // 3. Handle single file (backward compatibility)
//         if (req.body.file && req.body.file.startsWith('data:')) {
//             const fileData = req.body.file;
//             const fileName = req.body.fileName || 'File';
//             const fileDescription = req.body.fileDescription || '';

//             try {
//                 const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,/);
//                 const mimeType = matches ? matches[1] : 'application/octet-stream';
                
//                 let resourceType = 'auto';
//                 if (mimeType.startsWith('image/')) {
//                     resourceType = 'image';
//                 } else if (mimeType.startsWith('video/')) {
//                     resourceType = 'video';
//                 } else {
//                     resourceType = 'raw';
//                 }

//                 const uploadOptions = {
//                     folder: `team_files/${id}`,
//                     resource_type: resourceType,
//                     public_id: `${Date.now()}-${fileName.split('.')[0].replace(/\s/g, '_')}`,
//                     use_filename: true,
//                     unique_filename: true,
//                 };

//                 if (mimeType === 'application/pdf') {
//                     uploadOptions.format = 'pdf';
//                     uploadOptions.resource_type = 'raw';
//                 }

//                 const result = await cloudinary.uploader.upload(fileData, uploadOptions);

//                 const fileObject = {
//                     name: fileName,
//                     url: result.secure_url,
//                     fileSize: result.bytes || 0,
//                     fileType: mimeType,
//                     publicId: result.public_id,
//                     uploadedBy: userId,
//                     uploadedAt: new Date(),
//                     description: fileDescription
//                 };

//                 if (!team.files) {
//                     team.files = [];
//                 }
//                 const existingFile = team.files.find(f => f.url === result.secure_url);
//                 if (!existingFile) {
//                     team.files.push(fileObject);
//                 }
//             } catch (uploadError) {
//                 console.error('Error uploading file:', uploadError);
//             }
//         }

//         // Save updated team
//         const updatedTeam = await Team.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         )
//         .populate('members', 'name email profilePic')
//         .populate('createdBy', 'name email profilePic');

//         // Notify all team members
//         if (team.members && team.members.length > 0) {
//             team.members.forEach(memberId => {
//                 const socketId = userSocketMap[memberId.toString()];
//                 if (socketId) {
//                     io.to(socketId).emit('teamUpdated', {
//                         teamId: id,
//                         team: updatedTeam,
//                         message: `Team "${updatedTeam.name}" has been updated`
//                     });
//                 }
//             });
//         }

//         res.json({
//             success: true,
//             team: updatedTeam,
//             message: 'Team updated successfully',
//             filesCount: updatedTeam.files?.length || 0
//         });

//     } catch (error) {
//         console.error('Update team error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to update team'
//         });
//     }
// };

// controllers/teamController.js - Fixed updateTeam function

export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { 
            name, 
            description, 
            isPrivate, 
            coverImg,
            files,        // Array of base64 file data
            fileNames     // Array of file names
        } = req.body;

        console.log('📝 Updating team:', id);
        console.log('📎 Files received:', files?.length || 0);
        console.log('📎 File names received:', fileNames);

        // Find team
        const team = await Team.findById(id);
        if (!team) {
            console.log('❌ Team not found:', id);
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        console.log('✅ Team found:', team.name);
        console.log('📊 Current files in team:', team.files?.length || 0);

        // Check if user is admin
        if (!isTeamAdmin(team, userId)) {
            console.log('❌ User not admin:', userId);
            return res.status(403).json({
                success: false,
                message: 'Only the team creator can update team details'
            });
        }

        // Build update data
        let updateData = {
            name: name || team.name,
            description: description !== undefined ? description : team.description,
            isPrivate: isPrivate !== undefined ? isPrivate : team.isPrivate
        };

        // 1. Handle cover image (base64)
        if (coverImg) {
            console.log('🖼️ Processing cover image...');
            if (coverImg.startsWith('data:image')) {
                const uploadResponse = await cloudinary.uploader.upload(coverImg, {
                    folder: 'team_cover_images',
                    transformation: [
                        { width: 1200, height: 400, crop: 'fill' },
                        { quality: 'auto' },
                        { fetch_format: 'auto' }
                    ]
                });
                updateData.coverImg = uploadResponse.secure_url;
                console.log('✅ Cover image uploaded:', uploadResponse.secure_url);
            } else {
                updateData.coverImg = coverImg;
            }
        }

        // 2. Handle multiple files (base64 array)
        if (files && Array.isArray(files) && files.length > 0) {
            console.log(`📎 Processing ${files.length} files...`);
            
            // ✅ FIX: Initialize files array if it doesn't exist
            if (!team.files) {
                team.files = [];
            }

            // ✅ FIX: Store current file count before adding
            const initialFileCount = team.files.length;
            console.log(`📊 Initial files count: ${initialFileCount}`);

            // Process each file
            const uploadedFiles = [];
            for (let i = 0; i < files.length; i++) {
                const fileData = files[i];
                const fileName = fileNames && fileNames[i] ? fileNames[i] : `File ${i + 1}`;

                // Skip if file data is not valid
                if (!fileData || !fileData.startsWith('data:')) {
                    console.log(`⚠️ Skipping invalid file data at index ${i}`);
                    continue;
                }

                try {
                    console.log(`📤 Uploading file ${i + 1}: ${fileName}...`);
                    
                    // Extract mime type from base64
                    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,/);
                    const mimeType = matches ? matches[1] : 'application/octet-stream';
                    
                    // Determine resource type for Cloudinary
                    let resourceType = 'auto';
                    if (mimeType.startsWith('image/')) {
                        resourceType = 'image';
                    } else if (mimeType.startsWith('video/')) {
                        resourceType = 'video';
                    } else {
                        resourceType = 'raw';
                    }

                    // Upload to Cloudinary
                    const uploadOptions = {
                        folder: `team_files/${id}`,
                        resource_type: resourceType,
                        public_id: `${Date.now()}-${fileName.split('.')[0].replace(/\s/g, '_')}`,
                        use_filename: true,
                        unique_filename: true,
                    };

                    // Handle PDF specifically
                    if (mimeType === 'application/pdf') {
                        uploadOptions.format = 'pdf';
                        uploadOptions.resource_type = 'raw';
                    }

                    const result = await cloudinary.uploader.upload(fileData, uploadOptions);
                    console.log(`✅ File ${i + 1} uploaded:`, result.secure_url);

                    // ✅ FIX: Create file object with required fields
                    const fileObject = {
                        _id: new mongoose.Types.ObjectId(),
                        name: fileName,
                        url: result.secure_url,
                        fileSize: result.bytes || 0,
                        fileType: mimeType,
                        publicId: result.public_id,
                        uploadedBy: userId,
                        uploadedAt: new Date(),
                        description: ''
                    };

                    // ✅ FIX: Check if file already exists (prevent duplicates)
                    const existingFile = team.files.find(f => f.url === result.secure_url);
                    if (!existingFile) {
                        team.files.push(fileObject);
                        uploadedFiles.push(fileObject);
                        console.log(`✅ File ${i + 1} added to team`);
                    } else {
                        console.log(`⚠️ File ${i + 1} already exists`);
                    }
                } catch (uploadError) {
                    console.error(`❌ Error uploading file ${fileName}:`, uploadError);
                    // Continue with next file
                }
            }

            console.log(`📊 Uploaded ${uploadedFiles.length} new files`);
            console.log(`📊 Total files now: ${team.files.length}`);
        }

        // ✅ FIX: Log final file count before saving
        console.log(`💾 Saving team with ${team.files.length} files...`);

        // ✅ FIX: Save the team with the updated files array
        // We need to save before updating with findByIdAndUpdate
        await team.save();

        // Then update other fields
        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('members', 'fullName email profilePic status')
        .populate('createdBy', 'fullName email profilePic');

        // ✅ FIX: Make sure files are included in the response
        // The files should already be in the team from the save above
        // But if not, we need to merge them
        if (team.files && team.files.length > 0) {
            updatedTeam.files = team.files;
            await updatedTeam.save();
        }

        console.log(`✅ Team updated with ${updatedTeam.files?.length || 0} files`);

        // Notify all team members
        if (updatedTeam.members && updatedTeam.members.length > 0) {
            updatedTeam.members.forEach(memberId => {
                const socketId = userSocketMap[memberId.toString()];
                if (socketId) {
                    io.to(socketId).emit('teamUpdated', {
                        teamId: id,
                        team: updatedTeam,
                        message: `Team "${updatedTeam.name}" has been updated`
                    });
                }
            });
        }

        res.json({
            success: true,
            team: updatedTeam,
            message: 'Team updated successfully',
            filesCount: updatedTeam.files?.length || 0,
            uploadedFiles: team.files || []
        });

    } catch (error) {
        console.error('❌ Update team error:', error);
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

// controllers/teamController.js
export const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid team ID format'
            });
        }

        const team = await Team.findById(id)
            .populate('members', 'fullName email profilePic status')
            .populate('createdBy', 'fullName email profilePic');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // FIXED: Check if user is the creator OR a member
        const isCreator = team.createdBy && team.createdBy._id.toString() === userId.toString();
        
        // Check if user is in members array
        const isMember = team.members && team.members.some(member => {
            const memberId = member._id || member;
            return memberId.toString() === userId.toString();
        });

        // Allow access if user is creator OR member
        if (!isCreator && !isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this team'
            });
        }

        // Convert to object and add computed fields
        const teamObj = team.toObject();
        teamObj.isAdmin = isCreator;
        teamObj.isMember = isMember || isCreator;
        teamObj.memberCount = team.members ? team.members.length : 0;

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
            .populate('members', 'name email profilePic')
            .populate('createdBy', 'name email profilePic');

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

// controllers/teamController.js - Fixed removeFileFromTeam

// ===== REMOVE FILE FROM TEAM =====
export const removeFileFromTeam = async (req, res) => {
    try {
        const { id, fileId } = req.params;
        const userId = req.user._id;

        console.log('🗑️ Removing file:', fileId, 'from team:', id);

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
                message: 'Only the team creator can remove files'
            });
        }

        // ✅ FIX: Safe file check
        if (!team.files || team.files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No files found in team'
            });
        }

        // ✅ FIX: Find the file with safe ID comparison
        const fileIndex = team.files.findIndex(f => {
            if (!f) return false;
            const fId = f._id || f.id;
            return fId && fId.toString() === fileId;
        });

        if (fileIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const file = team.files[fileIndex];

        // Delete from Cloudinary if publicId exists
        if (file.publicId) {
            try {
                await cloudinary.uploader.destroy(file.publicId, {
                    resource_type: file.fileType && file.fileType.startsWith('image/') ? 'image' : 'raw'
                });
                console.log('✅ File deleted from Cloudinary');
            } catch (cloudinaryError) {
                console.error('Cloudinary delete error:', cloudinaryError);
            }
        }

        // Remove file from team
        team.files.splice(fileIndex, 1);
        await team.save();
        console.log('✅ File removed from team');

        const populatedTeam = await Team.findById(id)
            .populate('members', 'fullName email profilePic status')
            .populate('createdBy', 'fullName email profilePic');

        // Notify team members
        if (team.members && team.members.length > 0) {
            team.members.forEach(memberId => {
                const socketId = userSocketMap[memberId.toString()];
                if (socketId) {
                    io.to(socketId).emit('teamFileRemoved', {
                        teamId: id,
                        fileId: fileId,
                        team: populatedTeam,
                        message: `File "${file.name || 'Unknown'}" was removed from the team`
                    });
                }
            });
        }

        res.json({
            success: true,
            team: populatedTeam,
            message: 'File removed successfully'
        });

    } catch (error) {
        console.error('❌ Remove file error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to remove file'
        });
    }
};

// ===== GET TEAM FILES =====
// controllers/teamController.js - Fixed getTeamFiles function

// ===== GET TEAM FILES =====
export const getTeamFiles = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find team and populate members
        const team = await Team.findById(id)
            .populate('name', 'fullName email profilePic');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is a member or admin
        const isAdmin = isTeamAdmin(team, userId);
        const isMember = team.members ? team.members.some(m => {
            const memberId = m._id || m;
            return memberId.toString() === userId.toString();
        }) : false;
        
        if (!isAdmin && !isMember) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this team'
            });
        }

        // ✅ FIX: Get files safely
        const files = team.files || [];
        console.log(team);
        
        
        // ✅ FIX: Format files for response with proper checking
        const formattedFiles = files.map(file => {
            // Handle both cases: file is an object with _id or file._id is undefined
            return {
                _id: file._id || file.id || null,
                name: file.name || 'Unnamed file',
                url: file.url || '',
                fileSize: file.fileSize || 0,
                fileType: file.fileType || '',
                publicId: file.publicId || '',
                uploadedBy: file.uploadedBy || null,
                uploadedAt: file.uploadedAt || new Date(),
                description: file.description || ''
            };
        });

        // Sort by uploadedAt descending (newest first)
        const sortedFiles = formattedFiles.sort((a, b) => {
            const dateA = a.uploadedAt ? new Date(a.uploadedAt) : new Date(0);
            const dateB = b.uploadedAt ? new Date(b.uploadedAt) : new Date(0);
            return dateB - dateA;
        });

        // ✅ FIX: Remove any null entries
        const validFiles = sortedFiles.filter(file => file.url);

        res.json({
            success: true,
            files: validFiles,
            count: validFiles.length
        });

    } catch (error) {
        console.error('❌ Get team files error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get team files'
        });
    }
};

