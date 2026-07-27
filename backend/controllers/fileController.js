// controllers/cloudinaryController.js
import cloudinary from '../lib/cloudinary.js';
import Team from '../models/Team.js';

// ===== GENERATE SIGNED DOWNLOAD URL =====
export const generateSignedDownloadUrl = async (req, res) => {
    try {
        const { publicId, filename, fileId, teamId } = req.body;
        const userId = req.user._id;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID is required'
            });
        }

        // Verify user has access to this file
        if (teamId) {
            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: 'Team not found'
                });
            }

            const isMember = team.members.some(m => {
                const memberId = m._id || m;
                return memberId.toString() === userId.toString();
            });

            const isAdmin = team.createdBy.toString() === userId.toString();

            if (!isMember && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this file'
                });
            }
        }

        // ✅ CORRECT: Use Cloudinary's built-in signing method
        const timestamp = Math.floor(Date.now() / 1000);
        
        // ✅ CORRECT: Build the parameters object for signing
        const paramsToSign = {
            public_id: publicId,
            timestamp: timestamp,
            attachment: true,
            source: 'ml',
            type: 'upload'
        };

        // ✅ CORRECT: Use Cloudinary's api_sign_request method
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        // Build the download URL with all parameters
        const downloadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/download?api_key=${process.env.CLOUDINARY_API_KEY}&attachment=true&public_id=${encodeURIComponent(publicId)}&signature=${signature}&source=ml&timestamp=${timestamp}&type=upload`;

        // Track download if fileId is provided
        if (fileId && teamId) {
            try {
                const team = await Team.findById(teamId);
                if (team && team.files) {
                    const file = team.files.id(fileId);
                    if (file) {
                        file.downloads = (file.downloads || 0) + 1;
                        await team.save();
                    }
                }
            } catch (trackError) {
                console.error('Error tracking download:', trackError);
            }
        }

        res.json({
            success: true,
            downloadUrl: downloadUrl,
            publicId: publicId,
            filename: filename || 'download',
            message: 'Download URL generated successfully'
        });

    } catch (error) {
        console.error('Generate download URL error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate download URL'
        });
    }
};