import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);
    const scrollEnd = useRef(null);
    const [input, setInput] = useState('');

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return null;
        await sendMessage({ text: input.trim() });
        setInput("");
    };

    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Select an image file");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
            e.target.value = "";
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return selectedUser ? (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                    <img 
                        src={selectedUser.profilePic || assets.avatar_icon} 
                        alt={selectedUser.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex flex-col">
                        <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                            {selectedUser.fullName}
                            {onlineUsers.includes(selectedUser._id) && (
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                            )}
                        </p>
                        <p className="text-xs text-slate-400">
                            {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-200/70 transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <img src={assets.arrow_icon} alt="Back" className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-200/70 transition-colors text-slate-400 hover:text-slate-600">
                        <img src={assets.help_icon} alt="Help" className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ===== MESSAGES ===== */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-slate-50/30 to-white">
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === authUser._id;
                    return (
                        <div 
                            key={index} 
                            className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isMe && (
                                <img 
                                    src={selectedUser?.profilePic || assets.avatar_icon} 
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                />
                            )}
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                {msg.image ? (
                                    <div className={`px-2 py-1.5 rounded-2xl ${isMe ? 'rounded-br-none bg-[#3674B5]' : 'rounded-bl-none bg-slate-100'}`}>
                                        <img 
                                            src={msg.image} 
                                            alt="Shared image" 
                                            className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        isMe 
                                            ? 'rounded-br-none bg-[#3674B5] text-white' 
                                            : 'rounded-bl-none bg-slate-100 text-slate-800'
                                    }`}>
                                        {msg.text}
                                    </div>
                                )}
                                <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                                    {formatMessageTime(msg.createdAt)}
                                </span>
                            </div>
                            {isMe && (
                                <img 
                                    src={authUser?.profilePic || assets.avatar_icon} 
                                    alt="You"
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                />
                            )}
                        </div>
                    );
                })}
                <div ref={scrollEnd} />
            </div>

            {/* ===== INPUT ===== */}
            <div className="p-3 bg-white border-t border-slate-200/80">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 border border-transparent focus-within:border-[#3674B5] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(54,116,181,0.1)] transition-all duration-200">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 py-2"
                        />
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={handleSendImage}
                            className="hidden"
                        />
                        <label 
                            htmlFor="imageUpload"
                            className="cursor-pointer p-1 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0"
                        >
                            <img src={assets.gallery_icon} alt="Upload image" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-10 h-10 rounded-full bg-[#3674B5] hover:bg-[#578FCA] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 shadow-md shadow-[#3674B5]/20"
                    >
                        <img src={assets.send_button} alt="Send" className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl">
            <img src={assets.logo_icon} alt="Logo" className="w-16 h-16 opacity-40 mb-3" />
            <p className="text-slate-400 text-sm font-medium">Select a user to start chatting</p>
            <p className="text-slate-300 text-xs mt-1">Messages are end-to-end encrypted</p>
        </div>
    );
};

export default ChatContainer;