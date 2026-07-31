// components/Canvas.jsx - Fixed ID comparisons for displaying members

import React, { useState, useEffect, useRef, useCallback } from 'react'; 
import axios from 'axios';
import { 
    Pencil, Square, Circle, Type, Eraser, 
    Undo2, Redo2, Download, Trash2, Save, Minus, PlusIcon,
    X, Loader2, Users, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const Canvas = ({ canvasId, teamId, onClose }) => {
    // State
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [drawingData, setDrawingData] = useState([]); 
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [canvasInfo, setCanvasInfo] = useState(null);
    const [showCollaborators, setShowCollaborators] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [loadingMessage, setLoadingMessage] = useState('Initializing canvas...');
    
    // New state for Add Collaborator form
    const [selectedUserId, setSelectedUserId] = useState('');
    const [collabRole, setCollabRole] = useState('viewer');
    const [addingCollab, setAddingCollab] = useState(false);
    
    // Refs
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const lastPointRef = useRef(null);
    const startPointRef = useRef(null); 
    const coordinatesArrayRef = useRef([]);
    const saveTimeoutRef = useRef(null);
    
    // ============ LOAD FROM BACKEND ============
    useEffect(() => {
        const loadCanvas = async () => {
            if (!canvasId) {
                setIsLoading(false);
                return;
            }

            try {
                setLoadingMessage('Loading canvas from server...');
                const { data } = await axios.get(`/api/canvases/${canvasId}`);

                if (data.success && data.canvas) {
                    setCanvasInfo(data.canvas);
                    setTeamMembers(data.teamMembers || []);
                    
                    const loadedShapes = data.canvas.drawingData || [];
                    setDrawingData(loadedShapes);
                    setHistory([loadedShapes]);
                    setHistoryIndex(0);
                    
                    setTimeout(() => redrawCanvas(loadedShapes), 100);
                    toast.success('Canvas loaded successfully');
                } else {
                    throw new Error(data.message || 'Failed to load canvas');
                }
            } catch (error) {
                console.error('Load error:', error);
                toast.error(error.response?.data?.message || 'Failed to load canvas');
                setHistory([[]]);
                setHistoryIndex(0);
            } finally {
                setIsLoading(false);
            }
        };

        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;
        
        ctxRef.current = ctx;
        canvasElement.width = 1200;
        canvasElement.height = 800;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        loadCanvas();
    }, [canvasId]);

    // ============ AUTO-SAVE TO BACKEND AFTER 5 SEC ============
    useEffect(() => {
        if (isLoading || historyIndex <= 0) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveToBackend();
        }, 5000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [drawingData, isLoading, historyIndex]);

    const saveToBackend = async () => {
        if (!canvasId) return;
        try {
            const { data } = await axios.put(`/api/canvases/${canvasId}`, {
                drawingData: drawingData
            });
            
            if (data.success) {
                toast.success('Auto-saved', { duration: 2000 });
                setCanvasInfo(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
            toast.error('Auto-save failed');
        }
    };

    // ============ ADD COLLABORATOR METHOD ============
    const handleAddCollaborator = async () => {
        if (!selectedUserId) {
            toast.error('Please select a team member to add');
            return;
        }

        const selectedMember = teamMembers.find(m => m._id === selectedUserId);
        if (!selectedMember) {
            toast.error('Team member not found');
            return;
        }

        setAddingCollab(true);
        try {
            const { data } = await axios.post(`/api/canvases/${canvasId}/collaborators`, {
                email: selectedMember.email,
                role: collabRole
            });

            if (data.success) {
                setCanvasInfo(data.canvas);
                setSelectedUserId('');
                toast.success(`${selectedMember.fullName} added as ${collabRole}`);
            }
        } catch (error) {
            console.error('Add collaborator error:', error);
            toast.error(error.response?.data?.message || 'Failed to add collaborator');
        } finally {
            setAddingCollab(false);
        }
    };

    // ============ DRAWING LOGIC ============
    const drawLine = (ctx, item) => {
        ctx.beginPath();
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = item.strokeWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(item.startX || 0, item.startY || 0);
        ctx.lineTo(item.endX || 0, item.endY || 0);
        ctx.stroke();
    };

    const drawShape = (ctx, item) => {
        ctx.beginPath();
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = item.strokeWidth || 2; 
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (item.shapeType === 'rectangle') {
            const w = item.width || 0;
            const h = item.height || 0;
            ctx.rect(item.x || 0, item.y || 0, w, h);
        } else if (item.shapeType === 'circle') {
            ctx.arc(item.x || 0, item.y || 0, Math.max(0, item.radius || 25), 0, 2 * Math.PI);
        }
        ctx.stroke();
    };

    const drawText = (ctx, item) => {
        ctx.font = `${item.fontSize || 16}px Arial`;
        ctx.fillStyle = item.color || '#000000';
        ctx.fillText(item.text || '', item.x || 0, item.y || 0);
    };

    const drawPath = (ctx, item) => {
        if (!item.points || item.points.length === 0) return;
        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth || 2; 
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
    };

    const redrawCanvas = useCallback((data) => {
        const canvasEl = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvasEl) return;

        ctx.save();
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

        if (data && Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                if (item.type === 'line') drawLine(ctx, item);
                else if (item.type === 'shape') drawShape(ctx, item);
                else if (item.type === 'text') drawText(ctx, item);
                else if (item.type === 'path') drawPath(ctx, item);
            });
        }
        ctx.restore();
    }, []);

    const getMouseCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        if (!canvasRef.current) return;
        const { x, y } = getMouseCoords(e);
        
        setIsDrawing(true);
        startPointRef.current = { x, y };
        lastPointRef.current = { x, y };
        
        coordinatesArrayRef.current = [{ x, y }];

        if (tool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                const newText = { type: 'text', x, y, text, fontSize: 16, color };
                const updatedData = [...drawingData, newText];
                setDrawingData(updatedData);
                setHistory(prev => [...prev.slice(0, historyIndex + 1), updatedData]);
                setHistoryIndex(prev => prev + 1);
                redrawCanvas(updatedData);
            }
            setIsDrawing(false);
            coordinatesArrayRef.current = [];
        }
    };

    const draw = (e) => {
        if (!isDrawing || !canvasRef.current) return;
        
        const { x, y } = getMouseCoords(e);
        const ctx = ctxRef.current;
        if (!ctx) return;

        coordinatesArrayRef.current.push({ x, y });

        if (tool === 'pen' || tool === 'eraser') {
            ctx.beginPath();
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineWidth = tool === 'eraser' ? 20 : strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            lastPointRef.current = { x, y };
        } 
        else if (tool === 'rectangle' || tool === 'circle') {
            redrawCanvas(drawingData);
            
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            const startX = startPointRef.current.x;
            const startY = startPointRef.current.y;
            
            if (tool === 'rectangle') {
                const width = x - startX;
                const height = y - startY;
                ctx.rect(startX, startY, width, height);
            } else if (tool === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                ctx.arc(startX, startY, Math.max(0, radius), 0, 2 * Math.PI);
            }
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        
        let newShape = null;

        if (tool === 'pen' || tool === 'eraser') {
            if (coordinatesArrayRef.current.length > 1) {
                newShape = {
                    type: 'path',
                    points: [...coordinatesArrayRef.current],
                    color: tool === 'eraser' ? '#ffffff' : color,
                    strokeWidth: tool === 'eraser' ? 20 : strokeWidth,
                    isEraser: tool === 'eraser'
                };
            }
        } 
        else if (tool === 'rectangle') {
            const start = startPointRef.current;
            const end = coordinatesArrayRef.current[coordinatesArrayRef.current.length - 1];
            newShape = {
                type: 'shape',
                shapeType: 'rectangle',
                x: start.x,
                y: start.y,
                width: end.x - start.x,
                height: end.y - start.y,
                color: color,
                strokeWidth: strokeWidth 
            };
        } 
        else if (tool === 'circle') {
            const start = startPointRef.current;
            const end = coordinatesArrayRef.current[coordinatesArrayRef.current.length - 1];
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            newShape = {
                type: 'shape',
                shapeType: 'circle',
                x: start.x,
                y: start.y,
                radius: Math.max(0, radius),
                color: color,
                strokeWidth: strokeWidth 
            };
        }

        if (newShape) {
            const updatedData = [...drawingData, newShape];
            setDrawingData(updatedData);
            setHistory(prev => [...prev.slice(0, historyIndex + 1), updatedData]);
            setHistoryIndex(prev => prev + 1);
            redrawCanvas(updatedData); 
        }

        coordinatesArrayRef.current = [];
    };

    // ============ HISTORY ACTIONS ============
    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const newData = history[newIndex];
            setDrawingData(newData);
            redrawCanvas(newData);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const newData = history[newIndex];
            setDrawingData(newData);
            redrawCanvas(newData);
        }
    };

    const clearCanvas = () => {
        if (!window.confirm('Clear all drawings?')) return;
        setDrawingData([]);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), []]);
        setHistoryIndex(prev => prev + 1);
        redrawCanvas([]);
        toast.success('Canvas cleared');
    };

    // ============ MANUAL SAVE / EXPORT ============
    const saveDrawing = async () => {
        await saveToBackend();
    };

    const exportImage = () => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        try {
            const link = document.createElement('a');
            link.download = `${canvasInfo?.name || 'canvas'}.png`;
            link.href = canvasEl.toDataURL('image/png');
            link.click();
            toast.success('Image exported successfully');
        } catch (error) {
            toast.error('Failed to export image');
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setZoom(1);

    // Fixed: Use toString() for comparing IDs
    const availableMembers = teamMembers.filter(member => {
        const isCollaborator = canvasInfo?.collaborators?.some(c => c.user._id.toString() === member._id.toString());
        const isOwner = canvasInfo?.createdBy?._id?.toString() === member._id.toString();
        return !isCollaborator && !isOwner;
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col h-full relative">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-slate-200/80 dark:border-slate-700/80 flex-shrink-0">
                <div className="flex flex-wrap items-center gap-1">
                    <button onClick={() => setTool('pen')} className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Pen"><Pencil className="w-5 h-5" /></button>
                    <button onClick={() => setTool('rectangle')} className={`p-2 rounded-lg transition-colors ${tool === 'rectangle' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Rectangle"><Square className="w-5 h-5" /></button>
                    <button onClick={() => setTool('circle')} className={`p-2 rounded-lg transition-colors ${tool === 'circle' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Circle"><Circle className="w-5 h-5" /></button>
                    <button onClick={() => setTool('text')} className={`p-2 rounded-lg transition-colors ${tool === 'text' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Text"><Type className="w-5 h-5" /></button>
                    <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Eraser"><Eraser className="w-5 h-5" /></button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                    <select value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm">
                        <option value="1">1px</option><option value="2">2px</option><option value="4">4px</option><option value="6">6px</option><option value="8">8px</option><option value="12">12px</option>
                    </select>
                </div>
                
                <div className="flex flex-wrap items-center gap-1">
                    <button onClick={undo} disabled={historyIndex <= 0} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" title="Undo"><Undo2 className="w-5 h-5" /></button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" title="Redo"><Redo2 className="w-5 h-5" /></button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={handleZoomOut} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Zoom Out"><Minus className="w-5 h-5" /></button>
                    <span className="text-sm text-slate-600 dark:text-slate-300 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Zoom In"><PlusIcon className="w-5 h-5" /></button>
                    <button onClick={resetZoom} className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">Reset</button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={saveDrawing} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-green-600" title="Save"><Save className="w-5 h-5" /></button>
                    <button onClick={exportImage} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Export"><Download className="w-5 h-5" /></button>
                    <button onClick={clearCanvas} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors text-red-500" title="Clear"><Trash2 className="w-5 h-5" /></button>
                    <button onClick={() => setShowCollaborators(!showCollaborators)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" title="Team & Collaborators">
                        <Users className="w-5 h-5" />
                        {canvasInfo?.collaborators?.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center">{canvasInfo.collaborators.length}</span>}
                    </button>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Canvas Container with Zoom */}
            <div 
                className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-800 relative"
                style={{ cursor: 'crosshair' }}
            >
                <div style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.1s ease'
                }}>
                    <canvas
                        id="main-canvas"
                        ref={canvasRef}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg bg-white"
                        style={{ width: '1200px', height: '800px' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    />
                </div>

                {/* Floating Team Members Avatar Stack (Right Side) */}
                <div className="absolute top-6 right-6 flex flex-col items-center gap-2 z-20">
                    {teamMembers.map((member) => {
                        // Fixed: Use toString() for comparing IDs
                        const collab = canvasInfo?.collaborators?.find(c => c.user._id.toString() === member._id.toString());
                        const isOwner = canvasInfo?.createdBy?._id?.toString() === member._id.toString();
                        
                        return (
                            <div key={member._id} className="group relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden border-2 border-white dark:border-slate-800 shadow-md cursor-pointer transition-transform hover:scale-110">
                                    {member.profilePic ? (
                                        <img src={member.profilePic} alt={member.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        member.fullName?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                
                                {/* Hover Tooltip */}
                                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                    <p className="font-semibold">{member.fullName}</p>
                                    <p className="text-slate-300">{member.email}</p>
                                    {isOwner && <span className="block text-indigo-400 mt-1">Owner</span>}
                                    {collab && !isOwner && <span className="block text-emerald-400 mt-1 capitalize">{collab.role}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Collaborators & Team Management Panel */}
            {showCollaborators && (
                <div className="absolute top-16 right-4 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-80 z-30 flex flex-col gap-4 max-h-[85vh]">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h4 className="font-semibold text-slate-800 dark:text-white">Team Roster</h4>
                        <button onClick={() => setShowCollaborators(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X className="w-4 h-4" /></button>
                    </div>

                    {/* Add Collaborator Form */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <UserPlus className="w-4 h-4" />
                            Add Collaborator
                        </div>
                        
                        {availableMembers.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                <select 
                                    value={selectedUserId} 
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">Select team member...</option>
                                    {availableMembers.map(member => (
                                        <option key={member._id} value={member._id}>{member.fullName} ({member.email})</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleAddCollaborator} 
                                        disabled={addingCollab || !selectedUserId}
                                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {addingCollab ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-1">All team members are already collaborators.</p>
                        )}
                    </div>

                    {/* Unified Team & Collaborators List */}
                    <div className="flex-1 overflow-y-auto -mx-1 px-1">
                        <div className="space-y-2">
                            {teamMembers.map((member) => {
                                // Fixed: Use toString() for comparing IDs
                                const collab = canvasInfo?.collaborators?.find(c => c.user._id.toString() === member._id.toString());
                                const isOwner = canvasInfo?.createdBy?._id?.toString() === member._id.toString();
                                const roleLabel = isOwner ? 'Owner' : collab ? collab.role : 'Member';

                                return (
                                    <div key={member._id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium overflow-hidden flex-shrink-0">
                                            {member.profilePic ? (
                                                <img src={member.profilePic} alt={member.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                member.fullName?.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{member.fullName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full capitalize flex-shrink-0 ${
                                            roleLabel === 'Owner' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300' :
                                            roleLabel === 'editor' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' :
                                            roleLabel === 'viewer' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' :
                                            'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {roleLabel}
                                        </span>
                                    </div>
                                );
                            })}
                            {teamMembers.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No team members found</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <span>Tool: {tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
                    <span>Color: <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: color }}></span></span>
                    <span>Stroke: {strokeWidth}px</span>
                    <span className="text-green-500">● Ready</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Shapes: {drawingData.length}</span>
                    <span>Zoom: {Math.round(zoom * 100)}%</span>
                    <span>Last saved: {canvasInfo?.updatedAt ? new Date(canvasInfo.updatedAt).toLocaleTimeString() : 'Never'}</span>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{loadingMessage}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Canvas;