// hooks/useSocket.js
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useSocket = (userId) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!userId) {
            // Clean up socket if userId is null (user logged out)
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection
        const newSocket = io(backendUrl, {
            query: { userId },
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Online users event
        newSocket.on('getOnlineUsers', (users) => {
            console.log('Online users updated:', users);
            setOnlineUsers(users);
        });

        // Cleanup on unmount or userId change
        return () => {
            if (newSocket) {
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
                setOnlineUsers([]);
            }
        };
    }, [userId]);

    // Helper function to emit typing events
    const emitTyping = (receiverId) => {
        if (socketRef.current && isConnected && receiverId) {
            socketRef.current.emit('typing', { receiverId });
        }
    };

    // Helper function to emit stop typing events
    const emitStopTyping = (receiverId) => {
        if (socketRef.current && isConnected && receiverId) {
            socketRef.current.emit('stopTyping', { receiverId });
        }
    };

    // Helper function to join team room
    const joinTeamRoom = (teamId) => {
        if (socketRef.current && isConnected && teamId) {
            socketRef.current.emit('joinTeamRoom', teamId);
        }
    };

    // Helper function to leave team room
    const leaveTeamRoom = (teamId) => {
        if (socketRef.current && isConnected && teamId) {
            socketRef.current.emit('leaveTeamRoom', teamId);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        onlineUsers,
        emitTyping,
        emitStopTyping,
        joinTeamRoom,
        leaveTeamRoom,
    };
};