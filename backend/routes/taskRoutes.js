import express from 'express'
import { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskCheckList } from '../controllers/taskController.js'
import { protectRoute } from '../middleware/auth.js'

const taskRouter = express.Router()

// task manager routes
taskRouter.get("/dashboard-data", protectRoute, getDashboardData)
taskRouter.get("/user-dashboard-data", protectRoute, getUserDashboardData)
taskRouter.get("/", protectRoute, getTasks)
taskRouter.get("/:id", protectRoute, getTaskById)
taskRouter.post("/", protectRoute, createTask)
taskRouter.put("/:id", protectRoute, updateTask)
taskRouter.delete("/:id", protectRoute, deleteTask)
taskRouter.put("/:id/status", protectRoute, updateTaskStatus)
taskRouter.put("/:id/todo", protectRoute, updateTaskCheckList)


export default taskRouter