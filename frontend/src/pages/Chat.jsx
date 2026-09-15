// pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Send, Paperclip, Smile, MoreVertical,
    Phone, Video, Check, CheckCheck, X, Loader2,
    Trash2, Edit2, Building2, ChevronDown,
    MessageSquare, Globe, ArrowLeft,
    UsersRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useTeam } from '../context/TeamContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useChat } from '../context/ChatContext';

const Chat = () => {
    // ===== STATE =====
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [editMessage, setEditMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // separate for modal
    const [editingMessage, setEditingMessage] = useState(null);
    const [typing, setTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [teamUsers, setTeamUsers] = useState([]);
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);
    const [isGlobal, setIsGlobal] = useState(true);
    const [showMobileList, setShowMobileList] = useState(true); // mobile pane toggle

    // ===== CONTEXT =====
    const { authUser, token } = useAuth();
    const { socket } = useSocket(authUser?._id);
    const { teams, fetchTeams } = useTeam();

    // ===== REFS =====
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // =============================================
    // FETCH FUNCTIONS
    // =============================================
    const fetchAllUsers = async () => {
        try {
            const { data } = await axios.get('/api/messages/users');
            if (data.success) {
                const formattedChats = data.users
                    .filter(user => user._id !== authUser?._id)
                    .map(user => {
                        const last = data.lastMessages?.[user._id];
                        return {
                            ...user,
                            lastMessage: last?.text || 'No messages yet',
                            lastMessageTime: last?.createdAt || null,
                            lastMessageFromMe: last?.senderId === authUser?._id,
                            unread: data.unseenMessages?.[user._id] || 0,
                            online: onlineUsers.includes(user._id),
                        };
                    });
                setChats(formattedChats);
                setUnreadCounts(data.unseenMessages || {});
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamUsers = async (teamId) => {
        try {
            const token = localStorage.getItem('token');
            const [teamRes, messagesRes] = await Promise.all([
                axios.get(`/api/teams/${teamId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('/api/messages/users'),
            ]);
            if (!teamRes.data.success) return;

            const members = teamRes.data.team?.members || [];
            const lastMessages = messagesRes.data?.lastMessages || {};
            const unseenMessages = messagesRes.data?.unseenMessages || {};

            const formattedUsers = members
                .filter(member => member._id !== authUser?._id)
                .map(member => {
                    const last = lastMessages[member._id];
                    return {
                        ...member,
                        lastMessage: last?.text || 'No messages yet',
                        lastMessageTime: last?.createdAt || null,
                        lastMessageFromMe: last?.senderId === authUser?._id,
                        unread: unseenMessages[member._id] || 0,
                        online: onlineUsers.includes(member._id),
                    };
                });

            setTeamUsers(formattedUsers);
            setChats(formattedUsers);
            setUnreadCounts(unseenMessages);
        } catch (error) {
            console.error('Failed to fetch team users:', error);
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    // =============================================
    // MESSAGE OPERATIONS
    // =============================================
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!message.trim() && !selectedImage) return;
        if (!selectedChat) {
            toast.error('Please select a user to chat with');
            return;
        }
        setSending(true);
        try {
            const messageData = { text: message.trim(), image: selectedImage || null };
            const { data } = await axios.post(
                `/api/messages/send/${selectedChat._id}`,
                messageData
            );
            if (data.success) {
                setMessages(prev => [...prev, data.newMessage]);
                setMessage('');
                setSelectedImage(null);
                if (isGlobal) fetchAllUsers();
                else if (selectedTeam) fetchTeamUsers(selectedTeam._id);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleEditInput = (e) => {
        setEditMessage(e.target.value)
    }

    const handleEditMessage = async (messageId, newText) => {
        setSending(true)
        try {
            const { data } = await axios.put(`/api/messages/${messageId}`, { text: newText });
            if (data.success) {
                setMessages(prev =>
                    prev.map(msg => (msg._id === messageId ? data.message : msg))
                );
                setEditingMessage(null);
                toast.success('Message edited');
            }
        } catch (error) {
            console.error('Failed to edit message:', error);
            toast.error(error.response?.data?.message || 'Failed to edit message');
        }finally{
            setSending(false)
        }
    };

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

    const handleReaction = async (messageId, emoji) => {
        try {
            const { data } = await axios.post(`/api/messages/${messageId}/reaction`, { emoji });
            if (data.success) {
                setMessages(prev =>
                    prev.map(msg => (msg._id === messageId ? data.message : msg))
                );
            }
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    // =============================================
    // HANDLERS
    // =============================================
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setSelectedImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSelectChat = (user) => {
        setSelectedChat(user);
        fetchMessages(user._id);
        if (unreadCounts[user._id]) {
            setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));
        }
        setShowMobileList(false); // switch to chat pane on mobile
    };

    const handleSelectTeam = (team) => {
        setIsGlobal(false);
        setSelectedTeam(team);
        setSelectedChat(null);
        setMessages([]);
        setShowTeamDropdown(false);
        fetchTeamUsers(team._id);
    };

    const handleSelectGlobal = () => {
        setIsGlobal(true);
        setSelectedTeam(null);
        setSelectedChat(null);
        setMessages([]);
        setShowTeamDropdown(false);
        fetchAllUsers();
    };

    // =============================================
    // UI HELPERS
    // =============================================
    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatMessageDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString();
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(msg => {
            if (!msg.createdAt) return;
            const date = new Date(msg.createdAt).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const getDisplayName = () => (isGlobal ? 'Global Chat' : selectedTeam?.name || 'Select Team');
    const getMemberCount = () =>
        isGlobal ? chats.length : selectedTeam?.members?.length || 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // =============================================
    // MESSAGE BUBBLE
    // =============================================
    const MessageBubble = ({ message }) => {
        const isOwn =
            message.senderId?._id === authUser?._id ||
            message.senderId === authUser?._id;
        const idx = messages.indexOf(message);
        const showSender =
            !isOwn &&
            idx > 0 &&
            messages[idx - 1]?.senderId?._id !== message.senderId?._id;

        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && showSender && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 ml-2">
                            {message.senderId?.fullName || 'Unknown'}
                        </p>
                    )}
                    <div
                        className={`relative rounded-2xl px-3 py-2 sm:px-4 ${
                            isOwn
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'
                        }`}
                    >
                        {message.replyTo && (
                            <div className="text-xs opacity-70 mb-1 border-l-2 border-slate-400 pl-2">
                                <span className="font-medium">
                                    @{message.replyTo.senderId?.fullName}
                                </span>
                                <p className="truncate">{message.replyTo.text}</p>
                            </div>
                        )}
                        {message.image && (
                            <div className="mb-2">
                                <img
                                    src={message.image}
                                    alt="attachment"
                                    className="rounded-lg max-h-56 sm:max-h-64 w-auto cursor-pointer"
                                    onClick={() => setPreviewImage(message.image)}
                                    loading="lazy"
                                />
                            </div>
                        )}
                        {message.text && (
                            <p className="text-sm break-words">{message.text}</p>
                        )}
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
                        {message.reactions?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {message.reactions.map((reaction, i) => (
                                    <span
                                        key={i}
                                        className="text-xs bg-white/20 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-full"
                                    >
                                        {reaction.emoji}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action buttons — always visible on touch, hover on desktop */}
                    <div
                        className={`flex items-center gap-1 mt-1 transition-opacity ${
                            isOwn ? 'justify-end' : 'justify-start'
                        } md:opacity-0 md:group-hover:opacity-100`}
                    >
                        {isOwn && (
                            <>
                                <button
                                    onClick={() => setEditingMessage(message)}
                                    className="p-2 md:p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 lg:transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
                                </button>
                                <button
                                    onClick={() => handleDeleteMessage(message._id)}
                                    className="p-2 md:p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 lg:transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
                                </button>
                            </>
                        )}
                        {/* <button
                            onClick={() => handleReaction(message._id, '👍')}
                            className="p-2 md:p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="React"
                        >
                            <Smile className="w-3.5 h-3.5 md:w-3 md:h-3 text-slate-400" />
                        </button> */}
                    </div>
                </div>
            </div>
        );
    };

    // =============================================
    // EFFECTS
    // =============================================
    useEffect(() => {
        if (authUser) {
            fetchTeams();
            fetchAllUsers();
        }
    }, [authUser]);

    useEffect(() => {
        if (teams.length > 0 && !selectedTeam && !isGlobal) {
            setSelectedTeam(teams[0]);
        }
    }, [teams, isGlobal]);

    useEffect(() => {
        if (authUser && token) {
            if (isGlobal) fetchAllUsers();
            else if (selectedTeam) fetchTeamUsers(selectedTeam._id);
        }
    }, [authUser, token, isGlobal, selectedTeam?._id]);

    useEffect(() => {
        if (!socket) return;

        const onNew = (newMessage) => {
            if (
                selectedChat &&
                (newMessage.senderId === selectedChat._id ||
                    newMessage.receiverId === selectedChat._id)
            ) {
                setMessages(prev => [...prev, newMessage]);
            }
            if (isGlobal) fetchAllUsers();
            else if (selectedTeam) fetchTeamUsers(selectedTeam._id);
        };
        const onEdited = (editedMessage) => {
            setMessages(prev =>
                prev.map(msg => (msg._id === editedMessage._id ? editedMessage : msg))
            );
        };
        const onDeleted = ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        };
        const onTyping = ({ userId }) => {
            if (selectedChat && userId === selectedChat._id) setTypingUser(userId);
        };
        const onStopTyping = ({ userId }) => {
            if (selectedChat && userId === selectedChat._id) setTypingUser(null);
        };
        const onOnline = (users) => setOnlineUsers(users);

        socket.on('newMessage', onNew);
        socket.on('messageEdited', onEdited);
        socket.on('messageDeleted', onDeleted);
        socket.on('userTyping', onTyping);
        socket.on('userStoppedTyping', onStopTyping);
        socket.on('getOnlineUsers', onOnline);

        return () => {
            socket.off('newMessage', onNew);
            socket.off('messageEdited', onEdited);
            socket.off('messageDeleted', onDeleted);
            socket.off('userTyping', onTyping);
            socket.off('userStoppedTyping', onStopTyping);
            socket.off('getOnlineUsers', onOnline);
        };
    }, [socket, selectedChat?._id, isGlobal, selectedTeam?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // =============================================
    // RENDER
    // =============================================
    const groupedMessages = groupMessagesByDate(messages);
    const filteredChats = chats.filter(
        chat =>
            chat.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* dvh handles mobile browser chrome; fallback to vh for older browsers */}
            <div className="h-[calc(100dvh-120px)] md:h-[calc(100vh-120px)] flex gap-0 md:gap-4">
                {/* ===== SIDEBAR ===== */}
                <div
                    className={`
                        w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900
                        rounded-xl border border-slate-200/80 dark:border-slate-700/80
                        overflow-hidden flex-col
                        ${showMobileList ? 'flex' : 'hidden'} md:flex
                    `}
                >
                    {/* Team Selector */}
                    <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                        <div className="relative">
                            <button
                                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                                className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {isGlobal ? (
                                        <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                                    ) : (
                                        <UsersRound className="w-4 h-4 text-slate-500 shrink-0" />
                                    )}
                                    <span className="font-medium text-slate-800 dark:text-white truncate">
                                        {getDisplayName()}
                                    </span>
                                    <span className="hidden sm:inline text-xs text-slate-400 ml-auto shrink-0">
                                        {getMemberCount()} members
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                                        showTeamDropdown ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {showTeamDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-20 max-h-64 overflow-y-auto">
                                    <button
                                        onClick={handleSelectGlobal}
                                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                            isGlobal ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                                        }`}
                                    >
                                        <Globe className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-medium text-slate-800 dark:text-white">
                                            Global Chat
                                        </span>
                                        <span className="text-xs text-slate-400 ml-auto">
                                            {chats.length} users
                                        </span>
                                    </button>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                                    {teams.map((team) => (
                                        <button
                                            key={team._id}
                                            onClick={() => handleSelectTeam(team)}
                                            className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                                !isGlobal && selectedTeam?._id === team._id
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                                    : ''
                                            }`}
                                        >
                                            <UsersRound className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-800 dark:text-white">
                                                {team.name}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-auto">
                                                {team.members?.length || 0} members
                                            </span>
                                        </button>
                                    ))}
                                    {teams.length === 0 && (
                                        <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                                            No teams available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* List header + search */}
                    <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                                Messages
                                <span className="text-sm font-normal text-slate-400 ml-2">
                                    ({chats.length})
                                </span>
                            </h2>
                            {isGlobal ? (
                                <span className="text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-full">
                                    Global
                                </span>
                            ) : (
                                selectedTeam && (
                                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        {selectedTeam.name}
                                    </span>
                                )
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={isGlobal ? 'Search all users...' : 'Search team members...'}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Users list */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-8 px-4 text-slate-500 dark:text-slate-400">
                                {searchTerm ? 'No users found' : 'No users to chat with'}
                                {isGlobal && (
                                    <p className="text-sm mt-1">Switch to a team to see team members</p>
                                )}
                                {!isGlobal && !selectedTeam && (
                                    <p className="text-sm mt-1">Select a team to start chatting</p>
                                )}
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
                                        className={`flex items-center gap-3 p-3 sm:p-3.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                            isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                                {chat.fullName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            {isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                    {chat.fullName}
                                                </p>
                                                <span className="text-xs text-slate-400 shrink-0">
                                                    {chat.lastMessageTime
                                                        ? formatTime(chat.lastMessageTime)
                                                        : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                {chat.lastMessageFromMe && (
                                                    <span className="text-slate-400">You: </span>
                                                )}
                                                {chat.lastMessage || 'Start chatting...'}
                                            </p>
                                        </div>
                                        {unread > 0 && (
                                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">
                                                {unread}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ===== CHAT WINDOW ===== */}
                {selectedChat ? (
                    <div
                        className={`
                            flex-1 bg-white dark:bg-slate-900
                            rounded-xl border border-slate-200/80 dark:border-slate-700/80
                            overflow-hidden flex-col
                            ${showMobileList ? 'hidden' : 'flex'} md:flex
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                {/* Mobile back button */}
                                <button
                                    onClick={() => setShowMobileList(true)}
                                    className="md:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                                    aria-label="Back to conversations"
                                >
                                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </button>
                                <div className="relative shrink-0">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                        {selectedChat.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    {onlineUsers.includes(selectedChat._id) && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white truncate">
                                        {selectedChat.fullName}
                                    </p>
                                    <p
                                        className={`text-xs ${
                                            onlineUsers.includes(selectedChat._id)
                                                ? 'text-emerald-500'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        {onlineUsers.includes(selectedChat._id) ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-4">
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
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Image preview (pending send) */}
                        {selectedImage && (
                            <div className="relative p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                <div className="relative inline-block">
                                    <img src={selectedImage} alt="Preview" className="max-h-28 sm:max-h-32 rounded-lg" />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Edit message input */}
                        {editingMessage && (
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500 hidden sm:block">Editing</p>
                                    <input
                                        type="text"
                                        defaultValue={editingMessage.text}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleEditMessage(editingMessage._id, e.target.value);
                                            if (e.key === 'Escape') setEditingMessage(null);
                                        }}
                                        onChange={(e) => setEditMessage(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        autoFocus
                                    />
                                    <button
                                    type="submit"
                                    className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    aria-label="Send"
                                    onClick={(e) => handleEditMessage(editingMessage._id, editMessage)}
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                                    <button
                                        onClick={() => setEditingMessage(null)}
                                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Composer */}
                        {!editingMessage && (
                        <div className="p-2 sm:p-4 border-t border-slate-200/80 dark:border-slate-700/80">
                            <form onSubmit={sendMessage} className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                                    aria-label="Attach image"
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
                                    placeholder="Type a message..."
                                    className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {/* <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="hidden sm:inline-flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                                    aria-label="Emoji"
                                >
                                    <Smile className="w-5 h-5 text-slate-400" />
                                </button> */}
                                <button
                                    type="submit"
                                    disabled={(!message.trim() && !selectedImage) || sending}
                                    className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    aria-label="Send"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        </div>
                        )}
                    </div>
                ) : (
                    /* No chat selected */
                    <div className="hidden md:flex flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 items-center justify-center">
                        <div className="text-center px-4">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Your Messages
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isGlobal
                                    ? 'Select a user to start chatting'
                                    : 'Select a team member to start chatting'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image modal (received images) */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    />
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 p-2.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Close preview"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}
        </>
    );
};

export default Chat;