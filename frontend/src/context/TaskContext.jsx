// context/TaskContext.jsx (Fixed)
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusSummary, setStatusSummary] = useState({
        all: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0
    });
    const [dashboardData, setDashboardData] = useState(null);
    const [userDashboardData, setUserDashboardData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { authUser, socket, token } = useContext(AuthContext);

    // Check if user is authenticated
    useEffect(() => {
        if (authUser && token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [authUser, token]);

    const getTasks = async (filters = {}) => {
        // Check authentication first
        if (!authUser || !token) {
            console.warn('User not authenticated, cannot fetch tasks');
            setError('Please login to view tasks');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = queryParams ? `/api/tasks?${queryParams}` : '/api/tasks';
            
            const { data } = await axios.get(url);
            
            setTasks(data.tasks || []);
            setStatusSummary(data.statusSummary || {
                all: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0
            });
            
            return data;
        } catch (error) {
            console.error('Get tasks error:', error);
            
            // Handle authentication errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                const errorMsg = 'You are not authorized to view tasks. Please login again.';
                setError(errorMsg);
                toast.error(errorMsg);
                // Optionally redirect to login
                // window.location.href = '/login';
            } else {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch tasks';
                setError(errorMsg);
                toast.error(errorMsg);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getTaskById = async (taskId) => {
        if (!authUser || !token) {
            toast.error('Please login to view task');
            return null;
        }

        if (!taskId) {
            toast.error('Invalid request');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.get(`/api/tasks/${taskId}`);
            setCurrentTask(data);
            return data;
        } catch (error) {
            console.error('Get task error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch task';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData) => {
        if (!authUser || !token) {
            toast.error('Please login to create a task');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post('/api/tasks', taskData);
            
            if (data) {
                setTasks(prev => [data.task, ...prev]);
                setStatusSummary(prev => ({
                    ...prev,
                    all: prev.all + 1,
                    pendingTasks: prev.pendingTasks + 1
                }));

                toast.success(data.message || 'Task created successfully!');
                
                if (socket && taskData.assignedTo && taskData.assignedTo.length > 0) {
                    socket.emit('newTaskCreated', {
                        task: data.task,
                        assignedTo: taskData.assignedTo
                    });
                }
                
                return data.task;
            }
        } catch (error) {
            console.error('Create task error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to create task';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (taskId, updateData) => {
        if (!authUser || !token) {
            toast.error('Please login to update task');
            return null;
        }

        if (!taskId) {
            toast.error('Invalid request');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.put(`/api/tasks/${taskId}`, updateData);
            
            if (data) {
                setTasks(prev => 
                    prev.map(task => 
                        task._id === taskId ? data.updatedTask : task
                    )
                );
                
                if (currentTask?._id === taskId) {
                    setCurrentTask(data.updatedTask);
                }

                await getTasks();
                toast.success(data.message || 'Task updated successfully!');
                return data.updatedTask;
            }
        } catch (error) {
            console.error('Update task error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update task';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, status) => {
        if (!authUser || !token) {
            toast.error('Please login to update task status');
            return null;
        }

        if (!taskId || !status) {
            toast.error('Invalid request');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.put(`/api/tasks/${taskId}/status`, { status });
            
            if (data) {
                setTasks(prev => 
                    prev.map(task => 
                        task._id === taskId ? data.task : task
                    )
                );
                
                if (currentTask?._id === taskId) {
                    setCurrentTask(data.task);
                }

                await getTasks();
                toast.success(data.message || 'Task status updated successfully!');
                return data.task;
            }
        } catch (error) {
            console.error('Update task status error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update task status';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateTaskChecklist = async (taskId, todoChecklist) => {
        if (!authUser || !token) {
            toast.error('Please login to update checklist');
            return null;
        }

        if (!taskId || !todoChecklist) {
            toast.error('Invalid request');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.put(`/api/tasks/${taskId}/todo`, { todoChecklist });
            
            if (data) {
                setTasks(prev => 
                    prev.map(task => 
                        task._id === taskId ? data.task : task
                    )
                );
                
                if (currentTask?._id === taskId) {
                    setCurrentTask(data.task);
                }

                toast.success(data.message || 'Checklist updated successfully!');
                return data.task;
            }
        } catch (error) {
            console.error('Update checklist error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update checklist';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (taskId) => {
        if (!authUser || !token) {
            toast.error('Please login to delete task');
            return false;
        }

        if (!taskId) {
            toast.error('Invalid request');
            return false;
        }

        if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.delete(`/api/tasks/${taskId}`);
            
            if (data) {
                setTasks(prev => prev.filter(task => task._id !== taskId));
                
                if (currentTask?._id === taskId) {
                    setCurrentTask(null);
                }

                await getTasks();
                toast.success(data.message || 'Task deleted successfully!');
                return true;
            }
        } catch (error) {
            console.error('Delete task error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to delete task';
            setError(errorMsg);
            toast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getDashboardData = async () => {
        if (!authUser || !token) {
            toast.error('Please login to view dashboard');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.get('/api/tasks/dashboard-data');
            setDashboardData(data);
            return data;
        } catch (error) {
            console.error('Get dashboard data error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getUserDashboardData = async () => {
        if (!authUser || !token) {
            toast.error('Please login to view dashboard');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.get('/api/tasks/user-dashboard-data');
            setUserDashboardData(data);
            return data;
        } catch (error) {
            console.error('Get user dashboard data error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
            setError(errorMsg);
            toast.error(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const filterTasks = (filters) => {
        let filtered = [...tasks];
        
        if (filters.status) {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        
        if (filters.priority) {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }
        
        if (filters.assignedTo) {
            filtered = filtered.filter(task => 
                task.assignedTo?.some(user => user._id === filters.assignedTo)
            );
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title?.toLowerCase().includes(search) ||
                task.description?.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    };

    const getTaskStatistics = (taskList = tasks) => {
        const total = taskList.length;
        const pending = taskList.filter(t => t.status === 'Pending').length;
        const inProgress = taskList.filter(t => t.status === 'In Progress').length;
        const completed = taskList.filter(t => t.status === 'Completed').length;
        const overdue = taskList.filter(t => 
            t.status !== 'Completed' && 
            t.dueDate && 
            new Date(t.dueDate) < new Date()
        ).length;
        
        const high = taskList.filter(t => t.priority === 'High').length;
        const medium = taskList.filter(t => t.priority === 'Medium').length;
        const low = taskList.filter(t => t.priority === 'Low').length;
        
        return {
            total,
            pending,
            inProgress,
            completed,
            overdue,
            priorityBreakdown: { high, medium, low },
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('newTaskCreated', (data) => {
            console.log('New task created:', data);
            setTasks(prev => [data.task, ...prev]);
            toast.info(`New task: ${data.task.title}`);
        });

        socket.on('taskUpdated', (data) => {
            console.log('Task updated:', data);
            setTasks(prev => 
                prev.map(task => 
                    task._id === data.task._id ? data.task : task
                )
            );
            if (currentTask?._id === data.task._id) {
                setCurrentTask(data.task);
            }
        });

        socket.on('taskStatusChanged', (data) => {
            console.log('Task status changed:', data);
            setTasks(prev => 
                prev.map(task => 
                    task._id === data.task._id ? data.task : task
                )
            );
            if (currentTask?._id === data.task._id) {
                setCurrentTask(data.task);
            }
            toast.info(`Task "${data.task.title}" status changed to ${data.task.status}`);
        });

        socket.on('taskDeleted', (data) => {
            console.log('Task deleted:', data);
            setTasks(prev => prev.filter(task => task._id !== data.taskId));
            if (currentTask?._id === data.taskId) {
                setCurrentTask(null);
            }
            toast.info(`Task "${data.taskTitle}" was deleted`);
        });

        return () => {
            socket.off('newTaskCreated');
            socket.off('taskUpdated');
            socket.off('taskStatusChanged');
            socket.off('taskDeleted');
        };
    }, [socket, currentTask]);

    // Auto-fetch tasks when user authenticates
    useEffect(() => {
        if (authUser && token) {
            getTasks();
        } else {
            setTasks([]);
            setStatusSummary({
                all: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0
            });
        }
    }, [authUser, token]);

    const value = {
        tasks,
        setTasks,
        currentTask,
        setCurrentTask,
        loading,
        error,
        statusSummary,
        dashboardData,
        userDashboardData,
        isAuthenticated,

        getTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateTaskChecklist,

        getDashboardData,
        getUserDashboardData,

        filterTasks,
        getTaskStatistics,
        
        refreshTasks: () => getTasks(),
        clearCurrentTask: () => setCurrentTask(null),
        clearError: () => setError(null)
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTask = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
};