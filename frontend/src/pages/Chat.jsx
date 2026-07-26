// pages/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Send, Paperclip, Smile, MoreVertical,
    Phone, Video, User, Clock, Check, CheckCheck,
    Image as ImageIcon, File, Mic, X, Loader2,
    UserPlus, Settings, Trash2, Edit2, Reply,
    Download, Share2, Copy, Pin, Flag
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import axios from 'axios';
import toast from 'react-hot-toast';

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [typing, setTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});

    const { authUser, token } = useAuth();
    const { socket } = useSocket(authUser?._id);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Fetch users and messages
    useEffect(() => {
        if (authUser && token) {
            fetchChatUsers();
        }
    }, [authUser, token]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        // Listen for new messages
        socket.on('newMessage', (newMessage) => {
            if (selectedChat && (
                newMessage.senderId === selectedChat._id || 
                newMessage.receiverId === selectedChat._id
            )) {
                setMessages(prev => [...prev, newMessage]);
            }
            // Update chat list
            fetchChatUsers();
        });

        // Listen for message edits
        socket.on('messageEdited', (editedMessage) => {
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === editedMessage._id ? editedMessage : msg
                )
            );
        });

        // Listen for message deletions
        socket.on('messageDeleted', ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        });

        // Listen for typing indicators
        socket.on('userTyping', ({ userId }) => {
            if (selectedChat && userId === selectedChat._id) {
                setTypingUser(userId);
            }
        });

        socket.on('userStoppedTyping', ({ userId }) => {
            if (selectedChat && userId === selectedChat._id) {
                setTypingUser(null);
            }
        });

        // Listen for online users
        socket.on('getOnlineUsers', (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off('newMessage');
            socket.off('messageEdited');
            socket.off('messageDeleted');
            socket.off('userTyping');
            socket.off('userStoppedTyping');
            socket.off('getOnlineUsers');
        };
    }, [socket, selectedChat]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch chat users
    const fetchChatUsers = async () => {
        try {
            const { data } = await axios.get('/api/messages/users');
            if (data.success) {
                // Filter out current user and format chats
                const formattedChats = data.users
                    .filter(user => user._id !== authUser?._id)
                    .map(user => ({
                        ...user,
                        lastMessage: user.lastMessage || 'No messages yet',
                        time: user.lastMessageTime || 'Just now',
                        unread: data.unseenMessages?.[user._id] || 0,
                        online: onlineUsers.includes(user._id)
                    }));
                setChats(formattedChats);
                setUnreadCounts(data.unseenMessages || {});
            }
        } catch (error) {
            console.error('Failed to fetch chat users:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for selected chat
    const fetchMessages = async (userId) => {
        if (!userId) return;
        
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    // Send message
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!message.trim() && !selectedImage) return;
        if (!selectedChat) {
            toast.error('Please select a user to chat with');
            return;
        }

        setSending(true);
        
        try {
            const messageData = {
                text: message.trim(),
                image: selectedImage || null
            };

            const { data } = await axios.post(
                `/api/messages/send/${selectedChat._id}`,
                messageData
            );

            if (data.success) {
                setMessages(prev => [...prev, data.newMessage]);
                setMessage('');
                setSelectedImage(null);
                // Update chat list
                fetchChatUsers();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Handle typing
    const handleTyping = (e) => {
        setMessage(e.target.value);
        
        if (!typing && selectedChat) {
            setTyping(true);
            socket?.emit('typing', { receiverId: selectedChat._id });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (typing) {
                setTyping(false);
                socket?.emit('stopTyping', { receiverId: selectedChat._id });
            }
        }, 3000);
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Edit message
    const handleEditMessage = async (messageId, newText) => {
        try {
            const { data } = await axios.put(`/api/messages/${messageId}`, {
                text: newText
            });
            if (data.success) {
                setMessages(prev => 
                    prev.map(msg => 
                        msg._id === messageId ? data.message : msg
                    )
                );
                setEditingMessage(null);
                toast.success('Message edited');
            }
        } catch (error) {
            console.error('Failed to edit message:', error);
            toast.error(error.response?.data?.message || 'Failed to edit message');
        }
    };

    // Delete message
    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const { data } = await axios.delete(`/api/messages/${messageId}`);
            if (data.success) {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
                toast.success('Message deleted');
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            toast.error(error.response?.data?.message || 'Failed to delete message');
        }
    };

    // Add reaction to message
    const handleReaction = async (messageId, emoji) => {
        try {
            const { data } = await axios.post(`/api/messages/${messageId}/reaction`, {
                emoji
            });
            if (data.success) {
                setMessages(prev => 
                    prev.map(msg => 
                        msg._id === messageId ? data.message : msg
                    )
                );
            }
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    // Select chat user
    const handleSelectChat = (user) => {
        setSelectedChat(user);
        fetchMessages(user._id);
        // Mark messages as seen
        if (unreadCounts[user._id]) {
            setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));
        }
    };

    // Format timestamp
    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format message date
    const formatMessageDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (d.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return d.toLocaleDateString();
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.createdAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    const groupedMessages = groupMessagesByDate(messages);
    const filteredChats = chats.filter(chat =>
        chat.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Message component
    const MessageBubble = ({ message }) => {
        const isOwn = message.senderId?._id === authUser?._id || message.senderId === authUser?._id;
        const showSender = !isOwn && messages.indexOf(message) > 0 && 
                          messages[messages.indexOf(message) - 1]?.senderId?._id !== message.senderId?._id;

        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && showSender && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 ml-2">
                            {message.senderId?.fullName || 'Unknown'}
                        </p>
                    )}
                    <div className={`relative rounded-2xl px-4 py-2 ${
                        isOwn 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'
                    }`}>
                        {/* Reply indicator */}
                        {message.replyTo && (
                            <div className="text-xs opacity-70 mb-1 border-l-2 border-slate-400 pl-2">
                                <span className="font-medium">@{message.replyTo.senderId?.fullName}</span>
                                <p className="truncate">{message.replyTo.text}</p>
                            </div>
                        )}
                        
                        {/* Message content */}
                        {message.image && (
                            <div className="mb-2">
                                <img 
                                    src={message.image} 
                                    alt="Message attachment"
                                    className="rounded-lg max-h-64 w-auto cursor-pointer"
                                    onClick={() => setSelectedImage(message.image)}
                                    loading="lazy"
                                />
                            </div>
                        )}
                        
                        {message.text && (
                            <p className="text-sm break-words">{message.text}</p>
                        )}

                        {/* Message metadata */}
                        <div className="flex items-center justify-end gap-2 mt-1">
                            <span className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {formatTime(message.createdAt)}
                            </span>
                            {isOwn && (
                                <span className="text-xs">
                                    {message.seen ? (
                                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                        <Check className="w-3 h-3 text-slate-400" />
                                    )}
                                </span>
                            )}
                            {message.edited && (
                                <span className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    edited
                                </span>
                            )}
                        </div>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {message.reactions.map((reaction, idx) => (
                                    <span key={idx} className="text-xs bg-white/20 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-full">
                                        {reaction.emoji}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isOwn ? 'justify-end order-2' : 'justify-start order-1'
                    }`}>
                        {isOwn && (
                            <>
                                <button 
                                    onClick={() => setEditingMessage(message)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-3 h-3 text-slate-400" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteMessage(message._id)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3 h-3 text-slate-400" />
                                </button>
                            </>
                        )}
                        <button 
                            onClick={() => handleReaction(message._id, '👍')}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="React"
                        >
                            <Smile className="w-3 h-3 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-120px)] flex gap-4">
                {/* Chat List */}
                <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                            Messages
                            <span className="text-sm font-normal text-slate-400 ml-2">
                                ({chats.length})
                            </span>
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                {searchTerm ? 'No users found' : 'No conversations yet'}
                            </div>
                        ) : (
                            filteredChats.map((chat) => {
                                const isOnline = onlineUsers.includes(chat._id);
                                const unread = unreadCounts[chat._id] || 0;
                                const isSelected = selectedChat?._id === chat._id;

                                return (
                                    <div 
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                            isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                {chat.fullName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            {isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                    {chat.fullName}
                                                </p>
                                                <span className="text-xs text-slate-400 flex-shrink-0">
                                                    {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : 'Just now'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                {chat.lastMessage || 'Start chatting...'}
                                            </p>
                                        </div>
                                        {unread > 0 && (
                                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                                {unread}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                {selectedChat ? (
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                        {selectedChat.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    {onlineUsers.includes(selectedChat._id) && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">
                                        {selectedChat.fullName}
                                    </p>
                                    <p className={`text-xs ${onlineUsers.includes(selectedChat._id) ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {onlineUsers.includes(selectedChat._id) ? 'Online' : 'Offline'}
                                    </p>
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
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                        <MessageSquare className="w-8 h-8" />
                                    </div>
                                    <p>No messages yet</p>
                                    <p className="text-sm">Start a conversation with {selectedChat.fullName}</p>
                                </div>
                            ) : (
                                Object.entries(groupedMessages).map(([date, msgs]) => (
                                    <div key={date}>
                                        <div className="flex items-center justify-center my-4">
                                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                {formatMessageDate(new Date(date))}
                                            </span>
                                        </div>
                                        {msgs.map((msg) => (
                                            <MessageBubble key={msg._id} message={msg} />
                                        ))}
                                    </div>
                                ))
                            )}
                            {typingUser && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Image Preview */}
                        {selectedImage && (
                            <div className="relative p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                <div className="relative inline-block">
                                    <img 
                                        src={selectedImage} 
                                        alt="Preview" 
                                        className="max-h-32 rounded-lg"
                                    />
                                    <button 
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Edit Message Input */}
                        {editingMessage && (
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500">Editing message</p>
                                    <input
                                        type="text"
                                        defaultValue={editingMessage.text}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleEditMessage(editingMessage._id, e.target.value);
                                            }
                                            if (e.key === 'Escape') {
                                                setEditingMessage(null);
                                            }
                                        }}
                                        className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        autoFocus
                                    />
                                    <button 
                                        onClick={() => setEditingMessage(null)}
                                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80">
                            <form onSubmit={sendMessage} className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Paperclip className="w-5 h-5 text-slate-400" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <input 
                                    type="text"
                                    value={message}
                                    onChange={handleTyping}
                                    placeholder={`Message ${selectedChat.fullName || 'user'}...`}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Smile className="w-5 h-5 text-slate-400" />
                                </button>
                                <button 
                                    type="submit"
                                    disabled={!message.trim() && !selectedImage || sending}
                                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* No chat selected */
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Your Messages
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Select a conversation to start chatting
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && typeof selectedImage === 'string' && selectedImage.startsWith('http') && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-4xl max-h-[90vh] p-4">
                        <img 
                            src={selectedImage} 
                            alt="Full size" 
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Chat;