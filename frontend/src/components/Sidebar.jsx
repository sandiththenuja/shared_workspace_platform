import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);
    const [input, setInput] = useState(false);
    const navigate = useNavigate();

    const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    return (
        <div className="w-full h-full bg-white border-r border-slate-200/80 flex flex-col">
            {/* ===== HEADER ===== */}
            <div className="p-4 border-b border-slate-200/80">
                <div className="flex items-center justify-between">
                    <img src={assets.logo} alt="Logo" className="h-8" />
                    <div className="relative">
                        <img src={assets.menu_icon} alt="Menu" className="w-5 h-5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" />
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200/80 min-w-[140px] overflow-hidden z-10">
                            <p 
                                onClick={() => navigate('/profile')} 
                                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                Edit profile
                            </p>
                            <p 
                                onClick={() => logout()} 
                                className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors border-t border-slate-100"
                            >
                                Logout
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== SEARCH ===== */}
                <div className="mt-3 relative">
                    <img 
                        src={assets.search_icon} 
                        alt="Search" 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40"
                    />
                    <input 
                        onChange={(e) => setInput(e.target.value.toLowerCase())} 
                        type="text" 
                        placeholder="Search users..." 
                        className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200/80 text-sm outline-none transition-all duration-200 bg-slate-50 focus:bg-white focus:border-[#3674B5] focus:shadow-[0_0_0_3px_rgba(54,116,181,0.08)]"
                    />
                </div>
            </div>

            {/* ===== USER LIST ===== */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                        <div 
                            key={index} 
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                                selectedUser?._id === user._id 
                                    ? 'bg-[#D1F8EF] shadow-sm' 
                                    : 'hover:bg-slate-100'
                            }`}
                            onClick={() => { 
                                setSelectedUser(user); 
                                setUnseenMessages(prev => ({ ...prev, [user._id]: 0 })); 
                            }}
                        >
                            <img 
                                src={user?.profilePic || assets.avatar_icon} 
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-800 truncate">
                                    {user.fullName}
                                </p>
                                <p className={`text-xs ${
                                    onlineUsers.includes(user._id) 
                                        ? 'text-emerald-500' 
                                        : 'text-slate-400'
                                }`}>
                                    {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                                </p>
                            </div>
                            {unseenMessages[user._id] > 0 && (
                                <span className="bg-[#3674B5] text-white text-[11px] font-semibold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                                    {unseenMessages[user._id]}
                                </span>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                        <p className="text-sm">No users found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;