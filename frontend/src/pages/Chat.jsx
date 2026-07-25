// pages/Chat.js
import React, { useState } from 'react';
import { 
    Search, Send, Paperclip, Smile, MoreVertical,
    Phone, Video, User, Clock, Check, CheckCheck,
    Image, File, Mic
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(0);
    const [message, setMessage] = useState('');

    const chats = [
        { id: 0, name: 'Sarah Kim', lastMessage: 'Great, let\'s finalize the design', time: '2 min ago', unread: 2, online: true },
        { id: 1, name: 'Alex Rivera', lastMessage: 'Can you review the code?', time: '1 hour ago', unread: 0, online: false },
        { id: 2, name: 'Marcus Reed', lastMessage: 'Meeting at 3 PM', time: '3 hours ago', unread: 1, online: true },
        { id: 3, name: 'Emily Chen', lastMessage: 'New design files uploaded', time: '5 hours ago', unread: 0, online: false },
        { id: 4, name: 'Team General', lastMessage: 'Project updates', time: '1 day ago', unread: 3, online: true },
    ];

    const messages = [
        { id: 1, sender: 'Sarah Kim', content: 'Hey! How are the designs coming along?', time: '10:30 AM', isOwn: false },
        { id: 2, sender: 'You', content: 'Almost done! Just finishing up the final touches.', time: '10:32 AM', isOwn: true },
        { id: 3, sender: 'Sarah Kim', content: 'Great! Can you share the mockups?', time: '10:33 AM', isOwn: false },
        { id: 4, sender: 'You', content: 'Sure, here they are!', time: '10:35 AM', isOwn: true },
        { id: 5, sender: 'You', content: 'Let me know what you think.', time: '10:35 AM', isOwn: true },
        { id: 6, sender: 'Sarah Kim', content: 'These look amazing! Just one small change needed.', time: '10:38 AM', isOwn: false },
        { id: 7, sender: 'Sarah Kim', content: 'Can we adjust the colors to match the brand guide?', time: '10:38 AM', isOwn: false },
    ];

    return (
        <DashboardLayout>
        <div className="h-[calc(100vh-120px)] flex gap-4">
            {/* Chat List */}
            <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div 
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                selectedChat === chat.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                            }`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                    {chat.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{chat.name}</p>
                                    <span className="text-xs text-slate-400">{chat.time}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            SK
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-white">Sarah Kim</p>
                            <p className="text-xs text-emerald-500">Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Phone className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Video className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.isOwn ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'} rounded-2xl px-4 py-2`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {msg.time}
                                    {msg.isOwn && <CheckCheck className="w-3 h-3 inline ml-1" />}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Paperclip className="w-5 h-5 text-slate-400" />
                        </button>
                        <input 
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Smile className="w-5 h-5 text-slate-400" />
                        </button>
                        <button className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default Chat;