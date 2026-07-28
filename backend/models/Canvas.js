// models/Canvas.js
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
    drawingData: {
        lines: [{
            id: String,
            points: [Number],
            color: String,
            width: Number,
            tool: String
        }],
        shapes: [{
            id: String,
            x: Number,
            y: Number,
            width: Number,
            height: Number,
            radius: Number,
            color: String,
            strokeWidth: Number,
            tool: String
        }],
        texts: [{
            id: String,
            x: Number,
            y: Number,
            text: String,
            fontSize: Number,
            color: String,
            tool: String
        }]
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