// models/Canvas.js
import mongoose from "mongoose";

const canvasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Canvas name is required'],
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
    // Drawing data stored as JSON
    drawingData: {
        type: Object,
        default: {
            shapes: [],
            lines: [],
            text: [],
            images: []
        }
    },
    // Canvas size
    canvasSize: {
        width: { type: Number, default: 1200 },
        height: { type: Number, default: 800 }
    },
    // Background settings
    background: {
        type: String,
        default: '#ffffff'
    },
    // Sharing settings
    isPublic: {
        type: Boolean,
        default: false
    },
    // Tags for organization
    tags: [{
        type: String,
        trim: true
    }],
    // Collaborators
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['editor', 'viewer'],
            default: 'viewer'
        }
    }],
    // Last active
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes
canvasSchema.index({ teamId: 1, createdAt: -1 });
canvasSchema.index({ createdBy: 1 });

const Canvas = mongoose.model("Canvas", canvasSchema);

export default Canvas;