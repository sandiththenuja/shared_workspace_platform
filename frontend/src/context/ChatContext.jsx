import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'

export const ChatContext = createContext()

export const ChatProvider = ({children}) => {
    const [receiveMessages, setReceiveMessages] = useState([])
    const [allMessages, setAllMessages] = useState([])
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState([])

    const {socket} = useContext(AuthContext)

    // fn to get all users
    const getUsers = async() => {
        try {
            const {data} = await axios.get("/api/messages/users")
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
                setAllMessages(data.allMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    // fn get messages for selected user
    const getMessages = async(userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setReceiveMessages(data)
            }
            return data
        } catch (error) {
            toast.error(error.message)
        }
    }

    // fn to send message for selected user
    const sendMessage = async(messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if(data.success){
                setReceiveMessages((prevMessages) => [...prevMessages, data.newMessage])
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // fn to subscribe to messages for selected user
    const subscribeToMessages = async() => {
        if(!socket) return

        socket.on("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true
                setReceiveMessages((prevMessages) => [...prevMessages, newMessage])
                axios.put(`/messages/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId] : 
                    prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    // fn to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage")
    }

    useEffect(() => {
        subscribeToMessages()

        return () => unsubscribeFromMessages()
    }, [socket, selectedUser])

    const value = {
        receiveMessages,
        allMessages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    }

  return (
    <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a TaskProvider');
    }
    return context;
};
