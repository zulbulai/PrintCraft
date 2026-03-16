import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import { PaperSize, PAPER_SIZES, LayoutType } from '../types';
import { 
  Download, 
  Type, 
  RotateCcw, 
  RotateCw, 
  Maximize, 
  Image as ImageIcon, 
  Settings,
  Grid3X3,
  AlignLeft,
  MoreHorizontal,
  Music,
  Plus,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
  FileDown,
  FileCode,
  FileImage,
  Lightbulb,
  Mail,
  Globe,
  ExternalLink,
  HelpCircle,
  Info,
  Heart
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

interface EditorProps {
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  initialData?: string;
  onSizeChange?: (size: PaperSize) => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  paperSize, 
  orientation, 
  initialData,
  onSizeChange,
  onOrientationChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // PaperMe-inspired settings
  const [layoutType, setLayoutType] = useState<LayoutType>('lined');
  const [lineSpacing, setLineSpacing] = useState(8); // in mm
  const [margin, setMargin] = useState(15); // in mm
  const [lineThickness, setLineThickness] = useState(0.5); // in pt
  const [lineOpacity, setLineOpacity] = useState(0.3);
  const [themeColor, setThemeColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarColor, setSidebarColor] = useState('#ff0000');
  const [sidebarDistance, setSidebarDistance] = useState(30); // in mm
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);

  const addWatermark = (canvas: fabric.Canvas) => {
    const pxWidth = canvas.getWidth();
    const pxHeight = canvas.getHeight();
    
    const existing = canvas.getObjects().find(obj => (obj as any).isWatermark);
    if (existing) canvas.remove(existing);

    const watermark = new fabric.IText('Generated with PaperMe', {
      left: pxWidth / 2,
      top: pxHeight - 15,
      fontSize: 10,
      fill: 'rgba(0,0,0,0.15)',
      fontFamily: 'Inter',
      originX: 'center',
      selectable: false,
      evented: false,
    });
    (watermark as any).isWatermark = true;
    canvas.add(watermark);
    canvas.bringObjectToFront(watermark);
  };

  const updateBackgroundPattern = (canvas: fabric.Canvas) => {
    const pxSpacing = (lineSpacing * 96) / 25.4;
    const pxMargin = (margin * 96) / 25.4;
    const pxWidth = canvas.getWidth();
    const pxHeight = canvas.getHeight();

    // Remove existing pattern
    const existing = canvas.getObjects().filter(obj => (obj as any).isPattern);
    canvas.remove(...existing);

    if (lineSpacing <= 0) return;

    const patternOptions = {
      stroke: themeColor,
      strokeWidth: lineThickness,
      opacity: lineOpacity,
      selectable: false,
      evented: false,
    };

    const objectsToAdd: fabric.Object[] = [];

    if (layoutType === 'lined') {
      for (let y = pxMargin + pxSpacing; y < pxHeight - pxMargin; y += pxSpacing) {
        const line = new fabric.Line([pxMargin, y, pxWidth - pxMargin, y], patternOptions);
        (line as any).isPattern = true;
        objectsToAdd.push(line);
      }
    } else if (layoutType === 'grid') {
      // Horizontal lines
      for (let y = pxMargin; y <= pxHeight - pxMargin; y += pxSpacing) {
        const line = new fabric.Line([pxMargin, y, pxWidth - pxMargin, y], patternOptions);
        (line as any).isPattern = true;
        objectsToAdd.push(line);
      }
      // Vertical lines
      for (let x = pxMargin; x <= pxWidth - pxMargin; x += pxSpacing) {
        const line = new fabric.Line([x, pxMargin, x, pxHeight - pxMargin], patternOptions);
        (line as any).isPattern = true;
        objectsToAdd.push(line);
      }
    } else if (layoutType === 'dots') {
      for (let y = pxMargin; y <= pxHeight - pxMargin; y += pxSpacing) {
        for (let x = pxMargin; x <= pxWidth - pxMargin; x += pxSpacing) {
          const dot = new fabric.Circle({
            left: x,
            top: y,
            radius: lineThickness * 1.5,
            fill: themeColor,
            opacity: lineOpacity,
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center',
          });
          (dot as any).isPattern = true;
          objectsToAdd.push(dot);
        }
      }
    } else if (layoutType === 'staff') {
      const staffSpacing = pxSpacing * 0.8;
      const staffGap = pxSpacing * 2.5;
      for (let y = pxMargin + pxSpacing; y < pxHeight - pxMargin - (staffSpacing * 4); y += (staffSpacing * 4) + staffGap) {
        for (let i = 0; i < 5; i++) {
          const lineY = y + i * staffSpacing;
          const line = new fabric.Line([pxMargin, lineY, pxWidth - pxMargin, lineY], patternOptions);
          (line as any).isPattern = true;
          objectsToAdd.push(line);
        }
      }
    } else if (layoutType === 'cross') {
      const crossSize = pxSpacing * 0.2;
      for (let y = pxMargin; y <= pxHeight - pxMargin; y += pxSpacing) {
        for (let x = pxMargin; x <= pxWidth - pxMargin; x += pxSpacing) {
          const hLine = new fabric.Line([x - crossSize, y, x + crossSize, y], patternOptions);
          const vLine = new fabric.Line([x, y - crossSize, x, y + crossSize], patternOptions);
          (hLine as any).isPattern = true;
          (vLine as any).isPattern = true;
          objectsToAdd.push(hLine, vLine);
        }
      }
    }

    // Add sidebar (vertical line)
    if (showSidebar) {
      const sidebarX = pxMargin + (sidebarDistance * 96) / 25.4;
      if (sidebarX < pxWidth - pxMargin) {
        const sidebar = new fabric.Line([sidebarX, pxMargin, sidebarX, pxHeight - pxMargin], {
          stroke: sidebarColor,
          strokeWidth: 1.5,
          opacity: 0.8,
          selectable: false,
          evented: false,
        });
        (sidebar as any).isPattern = true;
        objectsToAdd.push(sidebar);
      }
    }

    canvas.add(...objectsToAdd);
    objectsToAdd.forEach(obj => canvas.sendObjectToBack(obj));
    canvas.renderAll();
  };

  const saveHistory = () => {
    if (!fabricCanvasRef.current) return;
    const json = fabricCanvasRef.current.toObject(['isPattern', 'isWatermark']);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(json));
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      const newIndex = historyIndex - 1;
      const json = JSON.parse(history[newIndex]);
      fabricCanvasRef.current.loadFromJSON(json).then(() => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
      const newIndex = historyIndex + 1;
      const json = JSON.parse(history[newIndex]);
      fabricCanvasRef.current.loadFromJSON(json).then(() => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.IText('Type here...', {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 20,
      fill: themeColor,
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    saveHistory();
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result;
      if (typeof data === 'string') {
        const img = await fabric.Image.fromURL(data);
        img.scaleToWidth(200);
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.setActiveObject(img);
        saveHistory();
      }
    };
    reader.readAsDataURL(file);
  };

  const rotateSelected = (angle: number) => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.set('angle', currentAngle + angle);
      fabricCanvasRef.current.renderAll();
      saveHistory();
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    const objects = fabricCanvasRef.current.getObjects().filter(obj => !(obj as any).isPattern && !(obj as any).isWatermark);
    fabricCanvasRef.current.remove(...objects);
    saveHistory();
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    fabricCanvasRef.current.remove(...activeObjects);
    fabricCanvasRef.current.discardActiveObject();
    saveHistory();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const dimensions = PAPER_SIZES[paperSize];
    const width = orientation === 'portrait' ? dimensions.width : dimensions.height;
    const height = orientation === 'portrait' ? dimensions.height : dimensions.width;

    const pxWidth = (width * 96) / 25.4;
    const pxHeight = (height * 96) / 25.4;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: pxWidth,
      height: pxHeight,
      backgroundColor: backgroundColor,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);
    canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    if (initialData) {
      canvas.loadFromJSON(JSON.parse(initialData)).then(() => {
        updateBackgroundPattern(canvas);
        addWatermark(canvas);
        canvas.renderAll();
        
        const json = JSON.stringify(canvas.toObject(['isPattern', 'isWatermark']));
        setHistory([json]);
        setHistoryIndex(0);
      });
    } else {
      updateBackgroundPattern(canvas);
      addWatermark(canvas);
      
      const json = JSON.stringify(canvas.toObject(['isPattern', 'isWatermark']));
      setHistory([json]);
      setHistoryIndex(0);
    }

    return () => {
      canvas.dispose();
    };
  }, [paperSize, orientation]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.set('backgroundColor', backgroundColor);
      updateBackgroundPattern(fabricCanvasRef.current);
      addWatermark(fabricCanvasRef.current);
      fabricCanvasRef.current.renderAll();
    }
  }, [layoutType, lineSpacing, margin, themeColor, lineThickness, lineOpacity, showSidebar, sidebarColor, sidebarDistance, backgroundColor]);

  const printCanvas = () => {
    if (!fabricCanvasRef.current) return;
    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      multiplier: 2,
    });
    const windowPrint = window.open('', '_blank');
    if (windowPrint) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Print PaperMe</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; }
              img { max-width: 100%; height: auto; box-shadow: 0 0 20px rgba(0,0,0,0.1); background: white; }
              @media print {
                body { background: white; }
                img { box-shadow: none; }
                @page { margin: 0; size: ${paperSize} ${orientation}; }
              }
            </style>
          </head>
          <body onload="window.print();window.close()">
            <img src="${dataUrl}" />
          </body>
        </html>
      `);
      windowPrint.document.close();
    }
  };

  const exportPDF = () => {
    if (!fabricCanvasRef.current) return;
    const dimensions = PAPER_SIZES[paperSize];
    const width = orientation === 'portrait' ? dimensions.width : dimensions.height;
    const height = orientation === 'portrait' ? dimensions.height : dimensions.width;

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [width, height],
    });

    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      multiplier: 4,
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    pdf.save(`paperme-${layoutType}-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-slate-300 font-sans">
      {/* Top Navigation */}
      <nav className="h-14 bg-[#111111] border-b border-white/5 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Printer size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">PaperMe</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
            <Grid3X3 size={16} className="text-orange-500" />
            Templates
          </button>
          <button className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
            <FileText size={16} className="text-orange-500" />
            Guide
          </button>
          <button className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
            <Info size={16} className="text-orange-500" />
            About
          </button>
          <button className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
            <Heart size={16} className="text-orange-500" />
            Support
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md text-xs font-bold">
            <Globe size={14} />
            English
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-[#111111] border-r border-white/5 flex flex-col z-20 overflow-y-auto custom-scrollbar">
          <div className="p-5 space-y-8">
            {/* Export Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={exportPDF}
                className="flex flex-col items-center gap-1 p-2 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-emerald-500 hover:bg-emerald-600/20 transition-all"
              >
                <FileDown size={20} />
                <span className="text-[10px] font-bold uppercase">Export PDF</span>
              </button>
              <button 
                className="flex flex-col items-center gap-1 p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-600/20 transition-all opacity-50 cursor-not-allowed"
              >
                <FileCode size={20} />
                <span className="text-[10px] font-bold uppercase">Export SVG</span>
              </button>
              <button 
                className="flex flex-col items-center gap-1 p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-indigo-500 hover:bg-indigo-600/20 transition-all opacity-50 cursor-not-allowed"
              >
                <FileImage size={20} />
                <span className="text-[10px] font-bold uppercase">Export PNG</span>
              </button>
            </div>

            {/* Paper Type */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <FileText size={14} className="text-indigo-500" />
                Paper Type
              </div>
              <select 
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value as LayoutType)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="lined">Lined Paper</option>
                <option value="grid">Grid Paper</option>
                <option value="dots">Dot Grid</option>
                <option value="staff">Music Staff</option>
                <option value="cross">Cross Grid</option>
              </select>
            </div>

            {/* Paper Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Maximize size={14} className="text-indigo-500" />
                Paper Size
              </div>
              <select 
                value={paperSize}
                onChange={(e) => onSizeChange?.(e.target.value as PaperSize)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {Object.keys(PAPER_SIZES).map(size => (
                  <option key={size} value={size}>{size} ({PAPER_SIZES[size as PaperSize].width} × {PAPER_SIZES[size as PaperSize].height} mm)</option>
                ))}
              </select>
              <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => onOrientationChange?.('portrait')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${orientation === 'portrait' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Portrait
                </button>
                <button 
                  onClick={() => onOrientationChange?.('landscape')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${orientation === 'landscape' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Settings size={14} className="text-pink-500" />
                Theme
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Line</span>
                  <input 
                    type="color" 
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Paper</span>
                  <input 
                    type="color" 
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Line Style */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <AlignLeft size={14} className="text-blue-500" />
                Line Style
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Line Spacing (mm)</span>
                  <span className="text-[10px] font-bold text-indigo-400">{lineSpacing}mm</span>
                </div>
                <input 
                  type="range" min="2" max="30" step="0.5"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Line Width (px)</span>
                  <span className="text-[10px] font-bold text-indigo-400">{lineThickness}px</span>
                </div>
                <input 
                  type="range" min="0.1" max="5" step="0.1"
                  value={lineThickness}
                  onChange={(e) => setLineThickness(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Opacity</span>
                  <span className="text-[10px] font-bold text-indigo-400">{Math.round(lineOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.05" max="1" step="0.05"
                  value={lineOpacity}
                  onChange={(e) => setLineOpacity(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Margin Settings */}
            <div className="space-y-4 pb-10">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Maximize size={14} className="text-emerald-500" />
                Margin Settings
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Margins (mm)</span>
                  <span className="text-[10px] font-bold text-indigo-400">{margin}mm</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1"
                  value={margin}
                  onChange={(e) => setMargin(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sidebar Toggle */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Vertical Sidebar</span>
                  <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`w-10 h-5 rounded-full transition-all relative ${showSidebar ? 'bg-indigo-600' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showSidebar ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                {showSidebar && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Distance (mm)</span>
                        <span className="text-[10px] font-bold text-indigo-400">{sidebarDistance}mm</span>
                      </div>
                      <input 
                        type="range" min="5" max="100" step="1"
                        value={sidebarDistance}
                        onChange={(e) => setSidebarDistance(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Color</span>
                      <input 
                        type="color" 
                        value={sidebarColor}
                        onChange={(e) => setSidebarColor(e.target.value)}
                        className="w-12 h-6 rounded cursor-pointer bg-transparent border border-white/10 p-0.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Canvas Area */}
          <div className="flex-1 min-h-[800px] flex flex-col items-center p-12 bg-[#1a1a1a]">
            {/* Zoom Controls */}
            <div className="mb-8 flex items-center gap-4 bg-[#111111] border border-white/5 p-2 rounded-xl shadow-2xl">
              <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-400">
                <ZoomOut size={18} />
              </button>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-xs font-bold text-slate-300 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <div className="w-px h-4 bg-white/10" />
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-400">
                <ZoomIn size={18} />
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 disabled:opacity-20">
                <RotateCcw size={18} />
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 disabled:opacity-20">
                <RotateCw size={18} />
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button onClick={printCanvas} className="p-2 hover:bg-white/5 rounded-lg text-slate-400" title="Print">
                <Printer size={18} />
              </button>
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.4)] transition-transform duration-200"
            >
              <canvas ref={canvasRef} />
            </motion.div>

            {/* Object Toolbar (Floating) */}
            <AnimatePresence>
              {fabricCanvasRef.current && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-12 bg-[#111111] border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center gap-2"
                >
                  <button 
                    onClick={addText}
                    className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all flex flex-col items-center gap-1"
                  >
                    <Type size={20} />
                    <span className="text-[10px] font-bold uppercase">Text</span>
                  </button>
                  
                  <label className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer">
                    <ImageIcon size={20} />
                    <span className="text-[10px] font-bold uppercase">Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={addImage} />
                  </label>

                  {selectedObject && (
                    <>
                      <div className="w-px h-8 bg-white/10 mx-2" />
                      <button 
                        onClick={() => rotateSelected(-90)}
                        className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all flex flex-col items-center gap-1"
                      >
                        <RotateCcw size={20} />
                        <span className="text-[10px] font-bold uppercase">Rotate</span>
                      </button>
                      <button 
                        onClick={deleteSelected}
                        className="p-3 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-all flex flex-col items-center gap-1"
                      >
                        <Plus size={20} className="rotate-45" />
                        <span className="text-[10px] font-bold uppercase">Delete</span>
                      </button>
                    </>
                  )}
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <button 
                    onClick={clearCanvas}
                    className="p-3 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-all flex flex-col items-center gap-1"
                  >
                    <RotateCcw size={20} />
                    <span className="text-[10px] font-bold uppercase">Clear</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tips Section */}
          <div className="bg-[#111111] border-t border-white/5 p-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <Lightbulb className="text-orange-500" size={24} />
                <h3 className="text-xl font-bold text-white">Tips</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-green-500" size={20} />
                    <h4 className="font-bold text-white">Custom Template</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    You can adjust various parameters in the control panel to create paper templates that fully meet your needs. After adjustments, click "Export Settings" to save your custom template.
                  </p>
                </div>
                
                <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Printer className="text-blue-500" size={20} />
                    <h4 className="font-bold text-white">Printing Advice</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    After generating PDF, it is recommended to use high-quality paper for printing. For colored templates, please ensure your printer has sufficient colored ink. Double-sided printing can save paper.
                  </p>
                </div>
                
                <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <RotateCw className="text-yellow-500" size={20} />
                    <h4 className="font-bold text-white">Creative Uses</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Our paper templates are not only suitable for note-taking and studying, but can also be used for diaries, planning, drawing, calligraphy practice, project management, and many other creative purposes. Use your imagination!
                  </p>
                </div>
              </div>

              {/* Contact Us */}
              <div className="mt-12 bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Contact Us</h4>
                    <p className="text-sm text-slate-400">If you have any questions, suggestions, or customization needs, please feel free to contact us.</p>
                  </div>
                </div>
                <a href="mailto:support@pixzens.com" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                  support@pixzens.com
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8 px-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      <Printer size={18} />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">PaperMe</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Provide you with beautiful custom printable papers to meet all your creative needs.
                  </p>
                </div>
                
                <div>
                  <h5 className="text-white font-bold mb-6 flex items-center gap-2">
                    <Mail size={16} className="text-indigo-500" />
                    Contact Us
                  </h5>
                  <ul className="space-y-4 text-sm text-slate-500">
                    <li className="flex items-center gap-2">
                      Email: <span className="text-slate-300">support@pixzens.com</span>
                    </li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Support Us</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-bold mb-6 flex items-center gap-2">
                    <ExternalLink size={16} className="text-indigo-500" />
                    Other Products
                  </h5>
                  <ul className="space-y-4 text-sm text-slate-500">
                    <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><FileDown size={14} /> PdfZap - PDF Compression Tool</a></li>
                    <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><RotateCw size={14} /> LIVP Converter</a></li>
                    <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><Download size={14} /> Twitloader - Twitter Video Downloader</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-bold mb-6 flex items-center gap-2">
                    <HelpCircle size={16} className="text-indigo-500" />
                    Support
                  </h5>
                  <p className="text-sm text-slate-500 mb-4">Help us keep the servers running and the paper flowing.</p>
                  <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Heart size={16} className="text-pink-500" />
                    Donate
                  </button>
                </div>
              </div>
              
              <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">© 2026 PaperMe. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
