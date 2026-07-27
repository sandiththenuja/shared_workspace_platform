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

// All routes require authentication
canvasRouter.use(protectRoute);

// Create canvas
canvasRouter.post('/', createCanvas);

// Get team canvases
canvasRouter.get('/team/:teamId', getTeamCanvases);

// Get single canvas
canvasRouter.get('/:id', getCanvasById);

// Update canvas
canvasRouter.put('/:id', updateCanvas);

// Delete canvas
canvasRouter.delete('/:id', deleteCanvas);

// Collaborators
canvasRouter.post('/:id/collaborators', addCollaborator);
canvasRouter.delete('/:id/collaborators/:collaboratorId', removeCollaborator);

export default canvasRouter;