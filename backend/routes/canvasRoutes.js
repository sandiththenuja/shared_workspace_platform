// routes/canvasRoutes.js
import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import {
    createCanvas,
    getTeamCanvases,
    getCanvasById,
    updateCanvas,
    deleteCanvas,
    addCollaborator,
    removeCollaborator
} from '../controllers/canvasController.js';

const canvasRouter = express.Router();

// Create canvas
canvasRouter.post('/', protectRoute, createCanvas);

// Get team canvases
canvasRouter.get('/team/:teamId', protectRoute, getTeamCanvases);

// Get single canvas
canvasRouter.get('/:id', protectRoute, getCanvasById);

// Update canvas
canvasRouter.put('/:id', protectRoute, updateCanvas);

// Delete canvas
canvasRouter.delete('/:id', protectRoute, deleteCanvas);

// Collaborators
canvasRouter.post('/:id/collaborators', protectRoute, addCollaborator);
canvasRouter.delete('/:id/collaborators/:collaboratorId', protectRoute, removeCollaborator);

export default canvasRouter;