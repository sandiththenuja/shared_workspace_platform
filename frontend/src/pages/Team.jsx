// pages/Team.js
import React, { useState } from 'react';
import { 
    UserPlus, Search, Filter, MoreVertical, 
    Mail, Phone, Calendar, Star, Users,
    ChevronDown, Grid, List, Award, Clock
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';

const Team = () => {
    const [view, setView] = useState('grid');
    const [roleFilter, setRoleFilter] = useState('all');

    const teamMembers = [
        { 
            id: 1, 
            name: 'Sarah Kim', 
            role: 'Design Lead', 
            email: 'sarah@collabnest.com',
            department: 'Design',
            status: 'online',
            projects: 5,
            joined: 'Jan 2024',
            avatar: 'SK'
        },
        { 
            id: 2, 
            name: 'Alex Rivera', 
            role: 'Senior Developer', 
            email: 'alex@collabnest.com',
            department: 'Engineering',
            status: 'away',
            projects: 8,
            joined: 'Mar 2023',
            avatar: 'AR'
        },
        { 
            id: 3, 
            name: 'Marcus Reed', 
            role: 'Product Manager', 
            email: 'marcus@collabnest.com',
            department: 'Product',
            status: 'online',
            projects: 6,
            joined: 'Jun 2023',
            avatar: 'MR'
        },
        { 
            id: 4, 
            name: 'Emily Chen', 
            role: 'UX Designer', 
            email: 'emily@collabnest.com',
            department: 'Design',
            status: 'offline',
            projects: 4,
            joined: 'Sep 2024',
            avatar: 'EC'
        },
        { 
            id: 5, 
            name: 'James Wilson', 
            role: 'Full Stack Developer', 
            email: 'james@collabnest.com',
            department: 'Engineering',
            status: 'online',
            projects: 7,
            joined: 'Nov 2023',
            avatar: 'JW'
        },
        { 
            id: 6, 
            name: 'Lisa Park', 
            role: 'Marketing Specialist', 
            email: 'lisa@collabnest.com',
            department: 'Marketing',
            status: 'offline',
            projects: 3,
            joined: 'Feb 2024',
            avatar: 'LP'
        },
    ];

    const departments = ['All', 'Design', 'Engineering', 'Product', 'Marketing'];

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Team</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {teamMembers.length} team members working together
                    </p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {departments.map((dept) => (
                        <button
                            key={dept}
                            onClick={() => setRoleFilter(dept.toLowerCase())}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                roleFilter === dept.toLowerCase() || (roleFilter === 'all' && dept === 'All')
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search team..."
                            className="w-full sm:w-48 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button 
                            onClick={() => setView('grid')}
                            className={`p-2 transition-colors ${view === 'grid' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 transition-colors ${view === 'list' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Team Grid */}
            {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                                            {member.avatar}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                            member.status === 'online' ? 'bg-emerald-400' :
                                            member.status === 'away' ? 'bg-yellow-400' : 'bg-slate-400'
                                        }`}></div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{member.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        {/* <FolderOpen className="w-4 h-4" /> */}
                                        <span>{member.projects} projects</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        <span>{member.joined}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <button className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Message
                                </button>
                                <button className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                                    <Star className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {teamMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">{member.name}</p>
                                                    <p className="text-sm text-slate-400">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                                                {member.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    member.status === 'online' ? 'bg-emerald-400' :
                                                    member.status === 'away' ? 'bg-yellow-400' : 'bg-slate-400'
                                                }`}></div>
                                                <span className="text-sm capitalize text-slate-600 dark:text-slate-300">{member.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{member.projects}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button className="text-indigo-600 dark:text-indigo-400 hover:underline">View</button>
                                            <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                <Mail className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
        </DashboardLayout>
    );
};

export default Team;