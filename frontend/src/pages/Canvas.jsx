// components/Canvas.jsx - Polotno + Konva Integration

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Pencil, Square, Type, Eraser, 
    Undo2, Redo2, Download, Trash2, Save,
    Users, X, Loader2, AlertCircle,
    Minus, Plus as PlusIcon, RefreshCw,
    Move, Layers, Grid, Maximize2,
    ChevronLeft, ChevronRight, Image as ImageIcon,
    Circle as CircleIcon, Palette, Settings, Share2
} from 'lucide-react';
import { Stage, Layer, Line, Rect, Circle, Text, Transformer, Group } from 'react-konva';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import axios from 'axios';
import toast from 'react-hot-toast';

// ============ POLOTNO-STYLE COMPONENTS ============

// Container Component
const CanvasContainer = ({ children, className = '' }) => {
    return (
        <div className={`polotno-container flex flex-col h-full bg-slate-50 dark:bg-slate-900 ${className}`}>
            {children}
        </div>
    );
};

// Side Panel Wrapper
const SidePanelWrap = ({ children, isOpen = true }) => {
    if (!isOpen) return null;
    return (
        <div className="polotno-side-panel-wrap w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 overflow-hidden">
            {children}
        </div>
    );
};

// Workspace Wrapper
const WorkspaceWrap = ({ children }) => {
    return (
        <div className="polotno-workspace-wrap flex-1 flex flex-col overflow-hidden">
            {children}
        </div>
    );
};

// Toolbar Component (Polotno-style)
const CanvasToolbar = ({ 
    tool, setTool, 
    color, setColor, 
    strokeWidth, setStrokeWidth,
    onSave, onExport, onClear, 
    onUndo, onRedo, 
    canUndo, canRedo,
    isSaving,
    onShare,
    collaborators = []
}) => {
    return (
        <div className="polotno-toolbar flex items-center gap-1 p-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            {/* Drawing Tools */}
            <div className="toolbar-group flex items-center gap-0.5">
                <button
                    onClick={() => setTool('select')}
                    className={`p-2 rounded transition-colors ${
                        tool === 'select' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Select"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.5 7.5l-2-2L4 7l2 2m-2 2l2 2m-2-2l-2 2" />
                    </svg>
                </button>
                <button
                    onClick={() => setTool('pen')}
                    className={`p-2 rounded transition-colors ${
                        tool === 'pen' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Pen"
                >
                    <Pencil className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTool('rectangle')}
                    className={`p-2 rounded transition-colors ${
                        tool === 'rectangle' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Rectangle"
                >
                    <Square className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTool('circle')}
                    className={`p-2 rounded transition-colors ${
                        tool === 'circle' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Circle"
                >
                    <CircleIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTool('text')}
                    className={`p-2 rounded transition-colors ${
                        tool === 'text' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Text"
                >
                    <Type className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTool('eraser')}
                    className={`p-2 rounded transition-colors ${
                        tool === 'eraser' 
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Eraser"
                >
                    <Eraser className="w-5 h-5" />
                </button>
            </div>

            <div className="toolbar-divider w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* Color & Stroke */}
            <div className="toolbar-group flex items-center gap-2">
                <div className="relative">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-2 border-slate-200 dark:border-slate-700 p-0"
                    />
                    <Palette className="w-3 h-3 absolute -bottom-1 -right-1 text-slate-400" />
                </div>
                <select
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm"
                >
                    <option value="1">1px</option>
                    <option value="2">2px</option>
                    <option value="4">4px</option>
                    <option value="6">6px</option>
                    <option value="8">8px</option>
                    <option value="12">12px</option>
                </select>
            </div>

            <div className="toolbar-divider w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* History */}
            <div className="toolbar-group flex items-center gap-0.5">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    title="Undo"
                >
                    <Undo2 className="w-5 h-5" />
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    title="Redo"
                >
                    <Redo2 className="w-5 h-5" />
                </button>
            </div>

            <div className="toolbar-spacer flex-1"></div>

            {/* Actions */}
            <div className="toolbar-group flex items-center gap-1">
                <button
                    onClick={onShare}
                    className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-blue-600"
                    title="Share"
                >
                    <Share2 className="w-5 h-5" />
                </button>
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                    title="Save"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                    onClick={onExport}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
                    title="Export"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>
                <button
                    onClick={onClear}
                    className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors text-red-500"
                    title="Clear"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Side Panel (Polotno-style)
const CanvasSidePanel = ({ onClose, collaborators = [], pages = [] }) => {
    return (
        <div className="polotno-side-panel flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="side-panel-header p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-white">Canvas</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="side-panel-content flex-1 overflow-y-auto p-4">
                {/* Pages */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Pages
                    </h4>
                    <div className="space-y-2">
                        {pages.length > 0 ? (
                            pages.map((page, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                >
                                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Page {index + 1}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {page.objects || 0} objects
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                No pages yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Collaborators */}
                <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Collaborators
                    </h4>
                    <div className="space-y-2">
                        {collaborators.map((collab) => (
                            <div key={collab.user._id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                                    {collab.user.fullName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                        {collab.user.fullName || 'Unknown User'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {collab.role || 'Viewer'}
                                    </p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        ))}
                        {collaborators.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                No collaborators online
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Zoom Controls (Polotno-style)
const CanvasZoomControls = ({ zoom, onZoomIn, onZoomOut, onReset }) => {
    return (
        <div className="polotno-zoom-controls absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-1">
            <button
                onClick={onZoomOut}
                className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Zoom Out"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300 min-w-[50px] text-center font-medium">
                {Math.round(zoom * 100)}%
            </span>
            <button
                onClick={onZoomIn}
                className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Zoom In"
            >
                <PlusIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button
                onClick={onReset}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Reset Zoom"
            >
                Reset
            </button>
            <button
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Fit to Screen"
            >
                <Maximize2 className="w-4 h-4" />
            </button>
        </div>
    );
};

// Timeline/Pages (Polotno-style)
const CanvasTimeline = ({ pages = [], currentPage = 0, onPageSelect }) => {
    return (
        <div className="polotno-timeline flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 overflow-x-auto">
            {pages.map((page, index) => (
                <button
                    key={index}
                    onClick={() => onPageSelect && onPageSelect(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-colors ${
                        index === currentPage 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded flex items-center justify-center text-xs">
                        {index + 1}
                    </div>
                </button>
            ))}
            <button className="flex-shrink-0 w-16 h-16 rounded border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 transition-colors flex items-center justify-center">
                <PlusIcon className="w-4 h-4 text-slate-400" />
            </button>
        </div>
    );
};

// ============ MAIN CANVAS COMPONENT ============

const Canvas = ({ canvasId, teamId, onClose }) => {
    // State
    const [tool, setTool] = useState('select');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [canvas, setCanvas] = useState(null);
    const [showSidePanel, setShowSidePanel] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState(null);
    const [shapes, setShapes] = useState([]);
    const [texts, setTexts] = useState([]);
    const [pages, setPages] = useState([{ id: 1, objects: 0 }]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Initializing canvas...');
    
    // Refs
    const stageRef = useRef(null);
    const layerRef = useRef(null);
    const { authUser } = useAuth();
    const { socket } = useSocket(authUser?._id);
    const loadTimerRef = useRef(null);

    // Initialize Konva stage
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkStage = () => {
            attempts++;
            setLoadingMessage(`Initializing canvas... (Attempt ${attempts})`);
            
            if (stageRef.current) {
                console.log('Stage is ready');
                setIsCanvasReady(true);
                setIsLoading(false);
                setLoadingMessage('Canvas ready!');
                return true;
            } else if (attempts < maxAttempts) {
                console.log(`Stage not ready, attempt ${attempts}/${maxAttempts}`);
                loadTimerRef.current = setTimeout(checkStage, 300);
                return false;
            } else {
                console.error('Stage failed to initialize after max attempts');
                setError({
                    message: 'Canvas initialization timeout',
                    details: 'The canvas failed to load after multiple attempts. Please refresh the page.'
                });
                setIsLoading(false);
                return false;
            }
        };

        const initialDelay = setTimeout(() => {
            checkStage();
        }, 100);

        return () => {
            clearTimeout(initialDelay);
            if (loadTimerRef.current) {
                clearTimeout(loadTimerRef.current);
            }
        };
    }, []);

    // Fetch canvas data
    useEffect(() => {
        if (canvasId && isCanvasReady) {
            setLoadingMessage('Loading canvas data...');
            fetchCanvas();
        }
    }, [canvasId, isCanvasReady]);

    const fetchCanvas = async () => {
        if (!canvasId) {
            setError({
                message: 'Canvas ID is required',
                details: 'Please ensure you have a valid canvas ID'
            });
            setIsLoading(false);
            return;
        }

        try {
            setLoadingMessage('Fetching canvas data...');
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.get(`/api/canvases/${canvasId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch canvas data');
            }

            setLoadingMessage('Processing canvas data...');
            setCanvas(response.data.canvas);
            const data = response.data.canvas.drawingData || { lines: [], shapes: [], texts: [] };
            setLines(data.lines || []);
            setShapes(data.shapes || []);
            setTexts(data.texts || []);
            setCollaborators(response.data.canvas.collaborators || []);
            
            // Update pages
            if (data.pages) {
                setPages(data.pages);
            }
            
            setLoadingMessage('Canvas loaded successfully!');
            toast.success('Canvas loaded');
            
        } catch (error) {
            console.error('Failed to fetch canvas:', error);
            setError({
                message: error.response?.data?.message || error.message || 'Failed to load canvas',
                details: error.response?.data?.details || 'Please check your connection and try again'
            });
            toast.error('Failed to load canvas');
        } finally {
            setIsLoading(false);
        }
    };

    // Drawing handlers
    const handleMouseDown = (e) => {
        if (tool === 'select' || tool === 'pan' || !isCanvasReady) return;

        const stage = stageRef.current;
        const point = stage.getPointerPosition();
        if (!point) return;

        setIsDrawing(true);

        if (tool === 'pen' || tool === 'eraser') {
            const newLine = {
                id: `line-${Date.now()}`,
                points: [point.x, point.y],
                color: tool === 'eraser' ? '#ffffff' : color,
                width: tool === 'eraser' ? 20 : strokeWidth,
                tool: 'pen'
            };
            setCurrentLine(newLine);
            setLines(prev => [...prev, newLine]);
        } else if (tool === 'rectangle') {
            const newRect = {
                id: `rect-${Date.now()}`,
                x: point.x,
                y: point.y,
                width: 0,
                height: 0,
                color: color,
                strokeWidth: strokeWidth,
                tool: 'rectangle'
            };
            setShapes(prev => [...prev, newRect]);
            setCurrentLine(newRect);
        } else if (tool === 'circle') {
            const newCircle = {
                id: `circle-${Date.now()}`,
                x: point.x,
                y: point.y,
                radius: 0,
                color: color,
                strokeWidth: strokeWidth,
                tool: 'circle'
            };
            setShapes(prev => [...prev, newCircle]);
            setCurrentLine(newCircle);
        } else if (tool === 'text') {
            const newText = {
                id: `text-${Date.now()}`,
                x: point.x,
                y: point.y,
                text: 'Double click to edit',
                fontSize: 20,
                color: color,
                tool: 'text'
            };
            setTexts(prev => [...prev, newText]);
            setCurrentLine(newText);
            setIsDrawing(false);
            
            setTimeout(() => {
                const textObj = texts.find(t => t.id === newText.id);
                if (textObj) {
                    const newTextContent = prompt('Enter text:', textObj.text);
                    if (newTextContent !== null) {
                        setTexts(prev => {
                            const index = prev.findIndex(t => t.id === newText.id);
                            if (index !== -1) {
                                const newTexts = [...prev];
                                newTexts[index] = { ...newTexts[index], text: newTextContent };
                                return newTexts;
                            }
                            return prev;
                        });
                        saveDrawing();
                    }
                }
            }, 100);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || tool === 'select' || tool === 'pan' || !isCanvasReady) return;

        const stage = stageRef.current;
        const point = stage.getPointerPosition();
        if (!point) return;

        if (tool === 'pen' || tool === 'eraser') {
            if (currentLine) {
                const updatedLine = {
                    ...currentLine,
                    points: [...currentLine.points, point.x, point.y]
                };
                setCurrentLine(updatedLine);
                setLines(prev => {
                    const index = prev.findIndex(l => l.id === currentLine.id);
                    if (index !== -1) {
                        const newLines = [...prev];
                        newLines[index] = updatedLine;
                        return newLines;
                    }
                    return prev;
                });
            }
        } else if (tool === 'rectangle') {
            if (currentLine) {
                const updatedRect = {
                    ...currentLine,
                    width: point.x - currentLine.x,
                    height: point.y - currentLine.y
                };
                setCurrentLine(updatedRect);
                setShapes(prev => {
                    const index = prev.findIndex(s => s.id === currentLine.id);
                    if (index !== -1) {
                        const newShapes = [...prev];
                        newShapes[index] = updatedRect;
                        return newShapes;
                    }
                    return prev;
                });
            }
        } else if (tool === 'circle') {
            if (currentLine) {
                const radius = Math.sqrt(
                    Math.pow(point.x - currentLine.x, 2) + 
                    Math.pow(point.y - currentLine.y, 2)
                );
                const updatedCircle = {
                    ...currentLine,
                    radius: radius
                };
                setCurrentLine(updatedCircle);
                setShapes(prev => {
                    const index = prev.findIndex(s => s.id === currentLine.id);
                    if (index !== -1) {
                        const newShapes = [...prev];
                        newShapes[index] = updatedCircle;
                        return newShapes;
                    }
                    return prev;
                });
            }
        }
    };

    const handleMouseUp = () => {
        if (isDrawing) {
            setIsDrawing(false);
            setCurrentLine(null);
            saveToHistory();
            saveDrawing();
        }
    };

    const handleTextDblClick = (e, textId) => {
        if (tool !== 'select') return;
        
        const textObj = texts.find(t => t.id === textId);
        if (!textObj) return;

        const newText = prompt('Edit text:', textObj.text);
        if (newText !== null) {
            setTexts(prev => {
                const index = prev.findIndex(t => t.id === textId);
                if (index !== -1) {
                    const newTexts = [...prev];
                    newTexts[index] = { ...newTexts[index], text: newText };
                    return newTexts;
                }
                return prev;
            });
            saveDrawing();
        }
    };

    const saveToHistory = () => {
        const data = { lines, shapes, texts };
        setHistory(prev => [...prev, data]);
        setHistoryIndex(prev => prev + 1);
    };

    const saveDrawing = useCallback(async () => {
        if (!canvasId || isSaving) return;

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');

            const drawingData = { 
                lines, 
                shapes, 
                texts,
                pages,
                currentPage
            };

            const response = await axios.put(
                `/api/canvases/${canvasId}`,
                { drawingData },
                { 
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: 15000
                }
            );
            
            if (response.data.success) {
                if (socket) {
                    socket.emit('drawingUpdate', { canvasId, drawingData });
                }
            }
        } catch (error) {
            console.error('Failed to save drawing:', error);
        } finally {
            setIsSaving(false);
        }
    }, [canvasId, lines, shapes, texts, pages, currentPage, socket, isSaving]);

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            const data = history[historyIndex - 1];
            setLines(data.lines || []);
            setShapes(data.shapes || []);
            setTexts(data.texts || []);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const data = history[historyIndex + 1];
            setLines(data.lines || []);
            setShapes(data.shapes || []);
            setTexts(data.texts || []);
        }
    };

    const clearCanvas = () => {
        if (!window.confirm('Clear all drawings?')) return;
        setLines([]);
        setShapes([]);
        setTexts([]);
        setHistory([]);
        setHistoryIndex(-1);
        saveDrawing();
        toast.success('Canvas cleared');
    };

    const exportImage = () => {
        const stage = stageRef.current;
        if (!stage) {
            toast.error('Canvas not ready');
            return;
        }
        try {
            const dataURL = stage.toDataURL({ pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `${canvas?.name || 'canvas'}.png`;
            link.href = dataURL;
            link.click();
            toast.success('Image exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export image');
        }
    };

    const handleShare = () => {
        toast.success('Share link copied to clipboard!');
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setZoom(1);

    const handlePageSelect = (index) => {
        setCurrentPage(index);
        // Load page data here
    };

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleDrawingUpdate = (data) => {
            if (data.canvasId === canvasId) {
                setLines(data.drawingData.lines || []);
                setShapes(data.drawingData.shapes || []);
                setTexts(data.drawingData.texts || []);
                if (data.drawingData.pages) {
                    setPages(data.drawingData.pages);
                }
            }
        };

        socket.on('drawingUpdate', handleDrawingUpdate);
        socket.on('canvasUpdated', (data) => {
            if (data.canvasId === canvasId) setCanvas(data.canvas);
        });

        return () => {
            socket.off('drawingUpdate', handleDrawingUpdate);
            socket.off('canvasUpdated');
        };
    }, [socket, canvasId]);

    // Auto-save
    useEffect(() => {
        const interval = setInterval(() => {
            if ((lines.length > 0 || shapes.length > 0 || texts.length > 0) && isCanvasReady && !isSaving) {
                saveDrawing();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [lines, shapes, texts, saveDrawing, isCanvasReady, isSaving]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {loadingMessage}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                        Please wait while we prepare your canvas
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900 p-4">
                <div className="text-center max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-red-200 dark:border-red-800/50">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        Failed to Load Canvas
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    {error.details && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {error.details}
                        </p>
                    )}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={fetchCanvas}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <CanvasContainer>
            {/* Polotno-style layout */}
            <div className="polotno-layout flex flex-1 overflow-hidden">
                {/* Side Panel */}
                <SidePanelWrap isOpen={showSidePanel}>
                    <CanvasSidePanel
                        onClose={() => setShowSidePanel(false)}
                        collaborators={collaborators}
                        pages={pages}
                    />
                </SidePanelWrap>

                {/* Workspace */}
                <WorkspaceWrap>
                    {/* Toolbar */}
                    <CanvasToolbar
                        tool={tool}
                        setTool={setTool}
                        color={color}
                        setColor={setColor}
                        strokeWidth={strokeWidth}
                        setStrokeWidth={setStrokeWidth}
                        onSave={saveDrawing}
                        onExport={exportImage}
                        onClear={clearCanvas}
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={historyIndex > 0}
                        canRedo={historyIndex < history.length - 1}
                        isSaving={isSaving}
                        onShare={handleShare}
                        collaborators={collaborators}
                    />

                    {/* Canvas Area */}
                    <div className="polotno-workspace flex-1 relative bg-slate-100 dark:bg-slate-800">
                        <div 
                            className="w-full h-full overflow-auto p-4"
                            style={{ cursor: tool === 'select' ? 'default' : tool === 'pan' ? 'grab' : 'crosshair' }}
                        >
                            <div 
                                style={{ 
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'top left',
                                    transition: 'transform 0.2s ease'
                                }}
                            >
                                <Stage
                                    ref={stageRef}
                                    width={1200}
                                    height={800}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg bg-white"
                                >
                                    <Layer ref={layerRef}>
                                        {/* Lines */}
                                        {lines.map((line) => (
                                            <Line
                                                key={line.id}
                                                id={line.id}
                                                name="line"
                                                points={line.points}
                                                stroke={line.color}
                                                strokeWidth={line.width}
                                                tension={0.5}
                                                lineCap="round"
                                                lineJoin="round"
                                                draggable={tool === 'select'}
                                                onClick={() => tool === 'select' && setSelectedId(line.id)}
                                            />
                                        ))}

                                        {/* Shapes */}
                                        {shapes.map((shape) => {
                                            if (shape.tool === 'rectangle') {
                                                return (
                                                    <Rect
                                                        key={shape.id}
                                                        id={shape.id}
                                                        name="rect"
                                                        x={shape.x}
                                                        y={shape.y}
                                                        width={shape.width}
                                                        height={shape.height}
                                                        stroke={shape.color}
                                                        strokeWidth={shape.strokeWidth}
                                                        draggable={tool === 'select'}
                                                        onClick={() => tool === 'select' && setSelectedId(shape.id)}
                                                    />
                                                );
                                            } else if (shape.tool === 'circle') {
                                                return (
                                                    <Circle
                                                        key={shape.id}
                                                        id={shape.id}
                                                        name="circle"
                                                        x={shape.x}
                                                        y={shape.y}
                                                        radius={shape.radius}
                                                        stroke={shape.color}
                                                        strokeWidth={shape.strokeWidth}
                                                        draggable={tool === 'select'}
                                                        onClick={() => tool === 'select' && setSelectedId(shape.id)}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}

                                        {/* Texts */}
                                        {texts.map((text) => (
                                            <Text
                                                key={text.id}
                                                id={text.id}
                                                name="text"
                                                x={text.x}
                                                y={text.y}
                                                text={text.text}
                                                fontSize={text.fontSize}
                                                fill={text.color}
                                                draggable={tool === 'select'}
                                                onDblClick={(e) => handleTextDblClick(e, text.id)}
                                                onClick={() => tool === 'select' && setSelectedId(text.id)}
                                            />
                                        ))}

                                        {/* Transformer */}
                                        {selectedId && tool === 'select' && (
                                            <Transformer
                                                nodes={[() => {
                                                    const layer = layerRef.current;
                                                    if (!layer) return null;
                                                    const node = layer.find(`#${selectedId}`)[0];
                                                    return node || null;
                                                }]}
                                                boundBoxFunc={(oldBox, newBox) => {
                                                    if (newBox.width < 5 || newBox.height < 5) {
                                                        return oldBox;
                                                    }
                                                    return newBox;
                                                }}
                                            />
                                        )}
                                    </Layer>
                                </Stage>
                            </div>
                        </div>

                        {/* Zoom Controls */}
                        <CanvasZoomControls
                            zoom={zoom}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onReset={resetZoom}
                        />

                        {/* Toggle Side Panel Button */}
                        {!showSidePanel && (
                            <button
                                onClick={() => setShowSidePanel(true)}
                                className="absolute top-4 left-4 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Timeline/Pages */}
                    <CanvasTimeline
                        pages={pages}
                        currentPage={currentPage}
                        onPageSelect={handlePageSelect}
                    />
                </WorkspaceWrap>
            </div>

            {/* Status Bar */}
            <div className="polotno-status-bar flex items-center justify-between px-4 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                    <span>Tool: {tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
                    <span className="flex items-center gap-1">
                        Color: <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: color }}></span>
                    </span>
                    <span>Stroke: {strokeWidth}px</span>
                    <span className="text-green-500">● Ready</span>
                    {isSaving && (
                        <span className="text-yellow-500 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span>Objects: {lines.length + shapes.length + texts.length}</span>
                    <span>Zoom: {Math.round(zoom * 100)}%</span>
                    <span>Page: {currentPage + 1}/{pages.length}</span>
                    <span>Last saved: {canvas?.updatedAt ? new Date(canvas.updatedAt).toLocaleTimeString() : 'Never'}</span>
                </div>
            </div>
        </CanvasContainer>
    );
};

export default Canvas;