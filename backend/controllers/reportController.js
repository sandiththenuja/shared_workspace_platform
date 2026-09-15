import Task from "../models/Task.js"
import User from "../models/User.js"
import Team from "../models/Team.js"
import excelJS from 'exceljs'

// @desc - export all tasks as excel file
// @route - GET/api/reports/exports/tasks
// @access - Private (admin)
export const exportTaskReport = async(req, res) => {
    try {
        const userId = req.user._id;
        const userTeams = await Team.find({
            $or: [{ createdBy: userId }, { members: userId }],
        }).select('_id');
        const teamIds = userTeams.map((t) => t._id);

        const tasks = await Task.find({ teamId: { $in: teamIds } })
            .populate('assignedTo', 'fullName email')
            .populate('teamId', 'name');
        const workbook = new excelJS.Workbook()
        const worksheet = workbook.addWorksheet("Tasks Report")

        worksheet.columns = [
            {header: "Task id", key: "task_id", width: 25},
            {header: "Title", key: "title", width: 30},
            {header: "Description", key: "description", width: 50},
            {header: "Priority", key: "priority", width: 15},
            {header: "Status", key: "status", width: 20},
            {header: "Team id", key: "team_id", width: 20},
            {header: "Team name", key: "team_name", width: 25},
            {header: "Due Date", key: "dueDate", width: 20},
            {header: "Assigned To", key: "assignedTo", width: 30},
        ]

        tasks.forEach((task) => {
            const assignedTo = task.assignedTo.map((user) => `${user.fullName} (${user.email})`)
            const team = task.teamId;
            worksheet.addRow({
                task_id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                team_id: team?._id?.toString() || '',
                team_name: team?.name || 'Unknown Team',
                dueDate: task.dueDate.toISOString().split("T")[0],
                assignedTo: assignedTo || "Unassigned"
            })
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader(
            "Content-Disposition",
            'attachments; filename="tasks_report.xlsx"'
        )

        return workbook.xlsx.write(res).then(() => {
            res.end()
        })
    } catch (error) {
        res.status(500).json({message: "Error exporting tasks", error: error.message})
    }
}

// @desc - export user task as excel file
// @route - GET/api/reports/exports/users
// @access - Private (admin)
export const exportUserReport = async(req, res) => {
    try {
        const userId = req.user._id;
        const userTeams = await Team.find({
            $or: [{ createdBy: userId }, { members: userId }],
        }).select('_id name members createdBy').lean();
        const teamIds = userTeams.map((t) => t._id);

        const userTeamMap = {};
        userTeams.forEach((team) => {
            const memberIds = new Set();
            if (team.createdBy) memberIds.add(team.createdBy.toString());
            (team.members || []).forEach((m) =>
                memberIds.add((m._id || m).toString())
            );
            memberIds.forEach((uid) => {
                if (!userTeamMap[uid]) userTeamMap[uid] = [];
                userTeamMap[uid].push(team.name);
            });
        });

        const memberIds = Object.keys(userTeamMap);
        const users = await User.find({ _id: { $in: memberIds } })
            .select('fullName email _id')
            .lean();

        const tasks = await Task.find({ teamId: { $in: teamIds } })
            .populate('assignedTo', 'fullName email _id')
            .lean();

        const userTaskMap = {};
        users.forEach((user) => {
            const uid = user._id.toString();
            userTaskMap[uid] = {
                name: user.fullName || 'Unknown',
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
                teamName: userTeamMap[uid]?.join(', ') || '—',
            };
        });


        tasks.forEach((task) => {
            if (task.assignedTo){
                task.assignedTo.forEach((assignedUser) => {
                    if (userTaskMap[assignedUser._id]){
                        userTaskMap[assignedUser._id].taskCount += 1
                        if (task.status === "Pending"){
                            userTaskMap[assignedUser._id].pendingTasks += 1
                        }else if (task.status === "In Progress"){
                            userTaskMap[assignedUser._id].inProgressTasks += 1
                        }else if (task.status === "Completed"){
                            userTaskMap[assignedUser._id].completedTasks += 1
                        }
                    }
                })
            }
        })

        const workbook = new excelJS.Workbook()
        const worksheet = workbook.addWorksheet("User Tasks Report")

        worksheet.columns = [
            {header: "Name", key: "name", width: 25},
            {header: "Total Assigned Tasks", key: "taskCount", width: 20},
            {header: "Pending Tasks", key: "pendingTasks", width: 20},
            {header: "In Progress Tasks", key: "inProgressTasks", width: 20},
            {header: "Completed Tasks", key: "completedTasks", width: 20},
            {header: "Team", key: "teamName", width: 20}
        ]

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user)
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader(
            "Content-Disposition",
            'attachments; filename="users_report.xlsx"'
        )

        return workbook.xlsx.write(res).then(() => {
            res.end()
        })
    } catch (error) {
        res.status(500).json({message: "Error exporting users", error: error.message})
    }
}