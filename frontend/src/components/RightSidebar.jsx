import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

const RightSidebar = () => {
    const { selectedUser, messages } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);
    const [msgImages, setMsgImages] = useState([]);

    useEffect(() => {
        setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image));
    }, [messages]);

    return selectedUser && (
        <div className="w-64 bg-white border-l border-slate-200/80 p-5 overflow-y-auto flex flex-col gap-4 h-full">
            {/* ===== PROFILE SECTION ===== */}
            <div className="flex flex-col items-center text-center gap-1.5">
                <img 
                    src={selectedUser?.profilePic || assets.avatar_icon} 
                    alt={selectedUser.fullName}
                    className="w-20 h-20 rounded-full object-cover border-3 border-slate-200 shadow-sm"
                />
                <h1 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                    {selectedUser.fullName}
                    {onlineUsers.includes(selectedUser._id) && (
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                    )}
                </h1>
                <p className="text-sm text-slate-500">{selectedUser.bio || 'No bio yet'}</p>
            </div>

            <hr className="border-slate-200/80 my-1" />

            {/* ===== MEDIA SECTION ===== */}
            <div className="flex flex-col gap-2">
                <p className="font-medium text-sm text-slate-700">Media</p>
                {msgImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1.5">
                        {msgImages.map((url, index) => (
                            <div 
                                key={index} 
                                onClick={() => window.open(url)} 
                                className="aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:opacity-80"
                            >
                                <img 
                                    src={url} 
                                    alt={`Media ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic">No media shared yet</p>
                )}
            </div>

            {/* ===== LOGOUT BUTTON ===== */}
            <button 
                onClick={() => logout()} 
                className="mt-auto p-2.5 border-none bg-red-50 text-red-500 rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-red-100 hover:scale-[1.02] active:scale-95"
            >
                Logout
            </button>
        </div>
    );
};

export default RightSidebar;