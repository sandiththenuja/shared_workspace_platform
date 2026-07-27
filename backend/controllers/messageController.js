import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUsersForSidebar = async(req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false});
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        });
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getMessages = async(req, res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        });
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const markMessageAsSeen = async(req, res) => {
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id, {seen: true});
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const sendMessage = async(req, res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ===== EDIT MESSAGE =====
export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        // Find message
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is the sender
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own messages'
            });
        }

        // ✅ FIX: Check if message is older than 5 minutes
        const fiveMinutes = 5 * 60 * 1000;
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        if (messageAge > fiveMinutes) {
            return res.status(403).json({
                success: false,
                message: 'Messages can only be edited within 5 minutes of sending'
            });
        }

        // ✅ FIX: Update message with edited flag
        message.text = text;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        // Get updated message with populated fields
        const updatedMessage = await Message.findById(id)
            .populate('senderId', 'fullName email profilePic')
            .populate('receiverId', 'fullName email profilePic');

        // Notify receiver
        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageEdited', updatedMessage);
        }

        // Notify sender
        const senderSocketId = userSocketMap[userId];
        if (senderSocketId) {
            io.to(senderSocketId).emit('messageEdited', updatedMessage);
        }

        res.json({
            success: true,
            message: updatedMessage,
            msg: 'Message edited successfully'
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to edit message'
        });
    }
};

// controllers/messageController.js

// ===== DELETE MESSAGE (Text & Image) =====
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find message
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is the sender
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        // Check if message is older than 10 minutes
        const tenMinutes = 10 * 60 * 1000;
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        if (messageAge > tenMinutes) {
            return res.status(403).json({
                success: false,
                message: 'Messages can only be deleted within 10 minutes of sending'
            });
        }

        // ===== DELETE IMAGE FROM CLOUDINARY IF EXISTS =====
        if (message.image) {
            try {
                // Extract public ID from Cloudinary URL
                // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
                const urlParts = message.image.split('/');
                const uploadIndex = urlParts.indexOf('upload');
                
                if (uploadIndex !== -1) {
                    // Get everything after 'upload' (excluding version)
                    const publicIdWithVersion = urlParts.slice(uploadIndex + 1).join('/');
                    // Remove version prefix (v1234567890/)
                    const publicId = publicIdWithVersion.replace(/^v\d+\//, '');
                    
                    // Delete from Cloudinary
                    const result = await cloudinary.uploader.destroy(publicId, {
                        resource_type: 'image',
                        invalidate: true
                    });
                    
                    console.log('✅ Image deleted from Cloudinary:', result);
                }
            } catch (cloudinaryError) {
                console.error('❌ Cloudinary delete error:', cloudinaryError);
                // Continue even if Cloudinary delete fails
            }
        }

        // ===== DELETE MESSAGE FROM DATABASE =====
        await Message.findByIdAndDelete(id);

        // ===== NOTIFY BOTH USERS VIA SOCKET =====
        // Notify receiver
        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageDeleted', { 
                messageId: id,
                senderId: userId,
                receiverId: message.receiverId
            });
        }

        // Notify sender
        const senderSocketId = userSocketMap[userId];
        if (senderSocketId) {
            io.to(senderSocketId).emit('messageDeleted', {
                messageId: id,
                senderId: userId,
                receiverId: message.receiverId
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete message error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete message'
        });
    }
};
