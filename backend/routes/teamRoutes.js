import express from 'express'
import { addTeamMember, createTeam, deleteTeam, getTeamById, getUserTeams, joinTeamByInvite, leaveTeam, removeTeamMember, updateTeam } from '../controllers/teamController.js'
import { protectRoute } from '../middleware/auth.js'

const teamRouter = express.Router()

// task manager routes
// teamRouter.get("/dashboard-data", protectRoute, getDashboardData)
// teamRouter.get("/user-dashboard-data", protectRoute, getUserDashboardData)
// teamRouter.get("/", protectRoute, getTasks)
// teamRouter.get("/:id", protectRoute, getTaskById)
teamRouter.post("/", protectRoute, createTeam)
teamRouter.put("/:id", protectRoute, updateTeam)
teamRouter.put("/:id/member", protectRoute, addTeamMember)
teamRouter.delete("/:id/:memberId", protectRoute, removeTeamMember)
teamRouter.delete("/:id/", protectRoute, deleteTeam)
teamRouter.get("/", protectRoute, getUserTeams)
teamRouter.get("/:id", protectRoute, getTeamById)
teamRouter.put("/:id/member/update", protectRoute, leaveTeam)
teamRouter.put("/:inviteCode/member/invite", protectRoute, joinTeamByInvite)
// teamRouter.put("/:id/todo", protectRoute, updateTaskCheckList)


export default teamRouter