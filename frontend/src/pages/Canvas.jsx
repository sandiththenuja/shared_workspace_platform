// components/Canvas.jsx - Fully functional tools & coordinate tracking

import React, { useState, useEffect, useRef, useCallback } from 'react'; 
import { 
    Pencil, Square, Circle, Type, Eraser, 
    Undo2, Redo2, Download, Trash2, Save,
    X, Loader2, Users,
    Minus, Plus as PlusIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============ MOCK DATA ============
const MOCK_CANVAS_DATA = {
    _id: 'mock-canvas-1',
    name: 'My Canvas',
    description: 'This is a mock canvas for demonstration',
    createdBy: { fullName: 'Demo User' },
    collaborators: [
        { user: { _id: 'user1', fullName: 'Collaborator 1' }, role: 'editor' },
        { user: { _id: 'user2', fullName: 'Collaborator 2' }, role: 'viewer' }
    ],
    drawingData: {
        shapes: [
            { type: 'line', startX: 100, startY: 200, endX: 300, endY: 400, color: '#ff0000', width: 4 },
            { type: 'shape', shapeType: 'rectangle', x: 500, y: 200, width: 150, height: 100, color: '#00ff00', width: 3 },
            { type: 'shape', shapeType: 'circle', x: 700, y: 400, radius: 50, color: '#ff00ff', width: 3 },
            { type: 'text', x: 200, y: 500, text: 'Hello World!', fontSize: 24, color: '#000000' }
        ]
    },
    updatedAt: new Date().toISOString()
};

const Canvas = ({ canvasId, teamId, onClose }) => {
    // State
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [drawingData, setDrawingData] = useState([]); // Committed shapes
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [collaborators, setCollaborators] = useState([]);
    const [canvasInfo, setCanvasInfo] = useState(null);
    const [showCollaborators, setShowCollaborators] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [loadingMessage, setLoadingMessage] = useState('Initializing canvas...');
    
    // Refs
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const lastPointRef = useRef(null);
    const startPointRef = useRef(null); // For shapes (rect/circle)
    
    // Array to insert coordinates when drawing
    const coordinatesArrayRef = useRef([]);
    const [coordinatesCount, setCoordinatesCount] = useState(0); // To trigger UI updates if needed

    // Initialize canvas on mount
    useEffect(() => {
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;
        
        ctxRef.current = ctx;
        
        canvasElement.width = 1200;
        canvasElement.height = 800;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
        setLoadingMessage('Canvas ready!');
        
        setCanvasInfo(MOCK_CANVAS_DATA);
        const shapes = MOCK_CANVAS_DATA.drawingData?.shapes || [];
        setDrawingData(shapes);
        setCollaborators(MOCK_CANVAS_DATA.collaborators || []);
        
        setHistory([shapes]);
        setHistoryIndex(0);
        
        redrawCanvas(shapes);
        
        toast.success('Canvas loaded (mock)');
        setIsLoading(false);
    }, []);

    // Drawing helper functions
    const drawLine = (ctx, item) => {
        ctx.beginPath();
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = item.width || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(item.startX || 0, item.startY || 0);
        ctx.lineTo(item.endX || 0, item.endY || 0);
        ctx.stroke();
    };

    const drawShape = (ctx, item) => {
        ctx.beginPath();
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = item.width || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (item.shapeType === 'rectangle') {
            ctx.rect(item.x || 0, item.y || 0, item.width || 50, item.height || 50);
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
        ctx.lineWidth = item.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
    };

    // Redraw canvas from data array
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

    // Get mouse coordinates adjusted for canvas scaling
    const getMouseCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    // ============ DRAWING FUNCTIONS ============
    const startDrawing = (e) => {
        if (!canvasRef.current) return;
        const { x, y } = getMouseCoords(e);
        
        setIsDrawing(true);
        startPointRef.current = { x, y };
        lastPointRef.current = { x, y };
        
        // Reset coordinate array for the new shape
        coordinatesArrayRef.current = [{ x, y }];
        setCoordinatesCount(1);
        console.log('🟢 Start Drawing - Coordinates Array:', coordinatesArrayRef.current);

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

        // Insert coordinates into array and display in console
        coordinatesArrayRef.current.push({ x, y });
        setCoordinatesCount(coordinatesArrayRef.current.length);
        console.log('✏️ Drawing - Coordinates Array Updated:', coordinatesArrayRef.current);

        if (tool === 'pen' || tool === 'eraser') {
            // Draw line segment directly on canvas for smooth performance
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
            // For shapes, redraw the base canvas, then draw the preview shape
            redrawCanvas(drawingData);
            
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            
            if (tool === 'rectangle') {
                const width = x - startPointRef.current.x;
                const height = y - startPointRef.current.y;
                ctx.rect(startPointRef.current.x, startPointRef.current.y, width, height);
            } else if (tool === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startPointRef.current.x, 2) + Math.pow(y - startPointRef.current.y, 2));
                ctx.arc(startPointRef.current.x, startPointRef.current.y, Math.max(0, radius), 0, 2 * Math.PI);
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
                    points: [...coordinatesArrayRef.current], // Save all collected coordinates
                    color: tool === 'eraser' ? '#ffffff' : color,
                    width: tool === 'eraser' ? 20 : strokeWidth,
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
                width: strokeWidth
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
                width: strokeWidth
            };
        }

        // Commit shape to main drawing array
        if (newShape) {
            const updatedData = [...drawingData, newShape];
            setDrawingData(updatedData);
            setHistory(prev => [...prev.slice(0, historyIndex + 1), updatedData]);
            setHistoryIndex(prev => prev + 1);
            redrawCanvas(updatedData); // Final clean redraw
        }

        // Clear coordinate array for the next shape
        console.log(`🔴 Stopped Drawing. Total Coordinates Captured: ${coordinatesArrayRef.current.length}`);
        coordinatesArrayRef.current = [];
        setCoordinatesCount(0);
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

    // ============ EXPORT / SAVE ============
    const saveDrawing = async () => {
        try {
            toast.loading('Saving...');
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.dismiss();
            toast.success('Drawing saved (mock)');
            setCanvasInfo(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to save drawing');
        }
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

    // Zoom helpers
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setZoom(1);

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
                    <button onClick={() => setShowCollaborators(!showCollaborators)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" title="Collaborators">
                        <Users className="w-5 h-5" />
                        {collaborators.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center">{collaborators.length}</span>}
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
            </div>

            {/* Collaborators Panel */}
            {showCollaborators && (
                <div className="absolute top-16 right-4 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-64 z-10">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800 dark:text-white">Collaborators</h4>
                        <button onClick={() => setShowCollaborators(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                        {collaborators.map((collab) => (
                            <div key={collab.user._id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">{collab.user.fullName?.charAt(0)}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">{collab.user.fullName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{collab.role}</p>
                                </div>
                            </div>
                        ))}
                        {collaborators.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No collaborators yet</p>}
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
                    <span>Live Coords Tracked: {coordinatesCount}</span>
                    <span>Saved Shapes: {drawingData.length}</span>
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