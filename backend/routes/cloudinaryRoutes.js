// routes/cloudinaryRoutes.js
import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { generateSignedDownloadUrl } from '../controllers/fileController.js';

const cloudinaryRouter = express.Router();

// Generate signed download URL (protected)
cloudinaryRouter.post('/generate-download-url', protectRoute, generateSignedDownloadUrl);

export default cloudinaryRouter;