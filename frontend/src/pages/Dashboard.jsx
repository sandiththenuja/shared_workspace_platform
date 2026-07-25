import React from 'react'
import DashboardLayout from '../layout/DashboardLayout'
import { 
    TrendingUp, Users, FolderOpen, MessageSquare, 
    Calendar, Clock, ArrowUp, ArrowDown, MoreVertical,
    Download, Eye, Star, Share2
} from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { icon: TrendingUp, label: 'Total Revenue', value: '$54,239', change: '+12.5%', positive: true },
        { icon: Users, label: 'Active Users', value: '2,847', change: '+8.2%', positive: true },
        { icon: FolderOpen, label: 'Projects', value: '142', change: '+3.1%', positive: true },
        { icon: MessageSquare, label: 'Messages', value: '1,293', change: '-2.4%', positive: false },
    ]

    const recentActivity = [
        { user: 'Sarah Kim', action: 'created a new project', time: '2 min ago', project: 'Marketing Campaign' },
        { user: 'Alex Rivera', action: 'commented on your file', time: '15 min ago', project: 'Q4 Report' },
        { user: 'Marcus Reed', action: 'assigned you a task', time: '1 hour ago', project: 'Website Redesign' },
        { user: 'Emily Chen', action: 'uploaded a new design', time: '2 hours ago', project: 'Mobile App' },
    ]

  return (
    <DashboardLayout>
        
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                        Welcome back, John! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Here's what's happening with your projects today.
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4 inline mr-2" />
                        Export
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                        <Share2 className="w-4 h-4 inline mr-2" />
                        Share
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                <stat.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-3">{stat.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                        <div className="flex items-center gap-1 mt-2">
                            {stat.positive ? (
                                <ArrowUp className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <ArrowDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${stat.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.change}
                            </span>
                            <span className="text-xs text-slate-400">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                            View all
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                                    {activity.user.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        <span className="font-semibold">{activity.user}</span>
                                        {' '}{activity.action}
                                        <span className="text-indigo-600 dark:text-indigo-400"> {activity.project}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                                {/* <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> */}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Create New Project</p>
                                <p className="text-xs text-slate-400">Start a new project</p>
                            </div>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Invite Team Members</p>
                                <p className="text-xs text-slate-400">Add collaborators</p>
                            </div>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule Meeting</p>
                                <p className="text-xs text-slate-400">Plan with your team</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
  )
}

export default Dashboard