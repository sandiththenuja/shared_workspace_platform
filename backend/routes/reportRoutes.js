import express from 'express'
import { exportTaskReport, exportUserReport } from '../controllers/reportController.js'
import { protectRoute } from '../middleware/auth.js'

const reportRouter = express.Router()

reportRouter.get("/export/tasks", protectRoute, exportTaskReport)
reportRouter.get("/export/users", protectRoute, exportUserReport)


export default reportRouter
