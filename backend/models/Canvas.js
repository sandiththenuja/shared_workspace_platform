import mongoose from 'mongoose';

const canvasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['viewer', 'editor'],
            default: 'viewer'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Changed to a flexible Array to store all shape types and their exact coordinates
    drawingData: {
        type: Array,
        default: []
    },
    background: {
        type: String,
        default: '#ffffff'
    },
    canvasSize: {
        width: { type: Number, default: 1200 },
        height: { type: Number, default: 800 }
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [String],
    lastActive: {
        type: Date,
        default: Date.now
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

const Canvas = mongoose.model('Canvas', canvasSchema);
export default Canvas;