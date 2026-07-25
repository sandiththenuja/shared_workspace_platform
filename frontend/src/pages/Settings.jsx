// pages/Settings.js
import React, { useState } from 'react';
import {
    User, Bell, Lock, Palette, Globe,
    Shield, CreditCard, HelpCircle, LogOut,
    ChevronRight, Moon, Sun, Save,
    Mail, Phone, MapPin, Link2
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false,
        updates: true,
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'preferences', label: 'Preferences', icon: Globe },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Profile Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                                            Change Photo
                                        </button>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF. Max 5MB</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            defaultValue="John Doe"
                                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            defaultValue="john@collabnest.com"
                                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                        <input 
                                            type="tel" 
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                        <input 
                                            type="text" 
                                            placeholder="San Francisco, CA"
                                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                                    <textarea 
                                        rows="3"
                                        placeholder="Tell us about yourself..."
                                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                            <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">Email Notifications</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                                    </div>
                                    <button 
                                        onClick={() => setNotifications({...notifications, email: !notifications.email})}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            notifications.email ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                            notifications.email ? 'transform translate-x-6' : ''
                                        }`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">Push Notifications</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive push notifications</p>
                                    </div>
                                    <button 
                                        onClick={() => setNotifications({...notifications, push: !notifications.push})}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            notifications.push ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                            notifications.push ? 'transform translate-x-6' : ''
                                        }`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">Marketing Emails</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive marketing and promotional emails</p>
                                    </div>
                                    <button 
                                        onClick={() => setNotifications({...notifications, marketing: !notifications.marketing})}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            notifications.marketing ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                            notifications.marketing ? 'transform translate-x-6' : ''
                                        }`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">Product Updates</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive product update notifications</p>
                                    </div>
                                    <button 
                                        onClick={() => setNotifications({...notifications, updates: !notifications.updates})}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            notifications.updates ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                            notifications.updates ? 'transform translate-x-6' : ''
                                        }`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Security Settings</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">Change Password</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Update your password regularly</p>
                                        </div>
                                        <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Change</button>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">Two-Factor Authentication</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                                        </div>
                                        <button className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Enabled</button>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">Active Sessions</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your active sessions</p>
                                        </div>
                                        <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">View All</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                            <button className="text-red-500 hover:text-red-600 font-medium flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                Sign out of all devices
                            </button>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Appearance Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">Dark Mode</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark theme</p>
                                    </div>
                                    <button 
                                        onClick={() => setDarkMode(!darkMode)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                            darkMode ? 'transform translate-x-6' : ''
                                        }`}></div>
                                    </button>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="font-medium text-slate-800 dark:text-white mb-2">Accent Color</p>
                                    <div className="flex gap-3">
                                        {['indigo', 'purple', 'pink', 'red', 'orange', 'emerald', 'blue'].map((color) => (
                                            <button 
                                                key={color}
                                                className={`w-8 h-8 rounded-full border-2 border-transparent hover:border-slate-400 transition-colors`}
                                                style={{ backgroundColor: color }}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Preferences</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
                                    <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time Zone</label>
                                    <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>UTC-8:00 Pacific Time</option>
                                        <option>UTC-5:00 Eastern Time</option>
                                        <option>UTC+0:00 GMT</option>
                                        <option>UTC+1:00 CET</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
                                    <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>MM/DD/YYYY</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your account preferences
                </p>
            </div>

            {/* Settings Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{tab.label}</span>
                            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </button>
                    ))}
                    <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default Settings;