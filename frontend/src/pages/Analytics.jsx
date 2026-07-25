// pages/Analytics.js
import React from 'react';
import {
    TrendingUp, TrendingDown, Users, Eye, 
    ArrowUp, ArrowDown, Download, Calendar,
    PieChart, BarChart, Activity, Zap,
    DollarSign, ShoppingBag, Clock
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';

const Analytics = () => {
    const metrics = [
        { label: 'Total Users', value: '12,847', change: '+12.5%', positive: true, icon: Users },
        { label: 'Page Views', value: '84,293', change: '+8.2%', positive: true, icon: Eye },
        { label: 'Revenue', value: '$54,239', change: '+15.3%', positive: true, icon: DollarSign },
        { label: 'Bounce Rate', value: '24.7%', change: '-3.1%', positive: true, icon: Activity },
    ];

    const chartData = [
        { day: 'Mon', value: 45 },
        { day: 'Tue', value: 52 },
        { day: 'Wed', value: 38 },
        { day: 'Thu', value: 65 },
        { day: 'Fri', value: 70 },
        { day: 'Sat', value: 48 },
        { day: 'Sun', value: 55 },
    ];

    const topPages = [
        { page: '/dashboard', visits: '2,847', bounce: '24.3%', avgTime: '4:32' },
        { page: '/projects', visits: '1,932', bounce: '31.7%', avgTime: '3:15' },
        { page: '/chat', visits: '1,845', bounce: '18.9%', avgTime: '6:47' },
        { page: '/files', visits: '1,234', bounce: '27.2%', avgTime: '2:58' },
        { page: '/settings', visits: '892', bounce: '42.1%', avgTime: '1:23' },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value));

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track your performance metrics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Last 7 days
                        <ArrowDown className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                <metric.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                metric.positive ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                                {metric.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                {metric.change}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-3">{metric.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Weekly Visitors</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                                <span>This week</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <span>Last week</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-3">
                        {chartData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                    className="w-full bg-indigo-500 rounded-t transition-all hover:opacity-80"
                                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                                ></div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie Chart / Quick Stats */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-5">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Traffic Sources</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300">Organic Search</span>
                                <span className="font-medium text-slate-800 dark:text-white">45%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300">Social Media</span>
                                <span className="font-medium text-slate-800 dark:text-white">25%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300">Direct</span>
                                <span className="font-medium text-slate-800 dark:text-white">20%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300">Referral</span>
                                <span className="font-medium text-slate-800 dark:text-white">10%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Pages Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/80">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Top Pages</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Page</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bounce Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {topPages.map((page, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-slate-800 dark:text-white">{page.page}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{page.visits}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{page.bounce}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{page.avgTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default Analytics;