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
  FileText
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

    const watermark = new fabric.IText('Generated with PaperMe Pro', {
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
      const staffHeight = pxSpacing * 4;
      const staffGap = pxSpacing * 2;
      for (let y = pxMargin + pxSpacing; y < pxHeight - pxMargin - staffHeight; y += staffHeight + staffGap) {
        for (let i = 0; i < 5; i++) {
          const lineY = y + i * pxSpacing;
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
    <div className="flex h-full bg-[#f3f4f6] overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        className="bg-white border-r border-gray-200 flex flex-col shadow-xl z-20 relative overflow-hidden"
      >
        <div className="p-6 flex-1 overflow-y-auto w-80">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Layout Settings</h2>
          </div>

          <div className="space-y-8">
            {/* Layout Type */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pattern Type</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'lined', icon: AlignLeft, label: 'Lined' },
                  { id: 'grid', icon: Grid3X3, label: 'Grid' },
                  { id: 'dots', icon: MoreHorizontal, label: 'Dots' },
                  { id: 'staff', icon: Music, label: 'Staff' },
                  { id: 'cross', icon: Plus, label: 'Cross' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setLayoutType(type.id as LayoutType)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      layoutType === type.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                    title={type.label}
                  >
                    <type.icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Spacing (mm)</label>
                <span className="text-xs font-bold text-indigo-600">{lineSpacing}mm</span>
              </div>
              <input 
                type="range" min="2" max="30" step="0.5"
                value={lineSpacing}
                onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Margin */}
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Margin (mm)</label>
                <span className="text-xs font-bold text-indigo-600">{margin}mm</span>
              </div>
              <input 
                type="range" min="0" max="100" step="1"
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Thickness */}
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thickness (pt)</label>
                <span className="text-xs font-bold text-indigo-600">{lineThickness}pt</span>
              </div>
              <input 
                type="range" min="0.1" max="5" step="0.1"
                value={lineThickness}
                onChange={(e) => setLineThickness(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opacity</label>
                <span className="text-xs font-bold text-indigo-600">{Math.round(lineOpacity * 100)}%</span>
              </div>
              <input 
                type="range" min="0.05" max="1" step="0.05"
                value={lineOpacity}
                onChange={(e) => setLineOpacity(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Line Color</label>
                <input 
                  type="color" 
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer border-none p-0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Paper Color</label>
                <input 
                  type="color" 
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer border-none p-0"
                />
              </div>
            </div>

            {/* Sidebar Toggle */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Vertical Sidebar</span>
                <button 
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`w-12 h-6 rounded-full transition-all relative ${showSidebar ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showSidebar ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {showSidebar && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-4">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sidebar Distance (mm)</label>
                      <span className="text-xs font-bold text-indigo-600">{sidebarDistance}mm</span>
                    </div>
                    <input 
                      type="range" min="5" max="100" step="1"
                      value={sidebarDistance}
                      onChange={(e) => setSidebarDistance(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sidebar Color</label>
                    <input 
                      type="color" 
                      value={sidebarColor}
                      onChange={(e) => setSidebarColor(e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer border-none p-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Toggle Button (Inside) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 border-r-0 p-1 rounded-l-md shadow-md hover:bg-gray-50 z-30"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              <select 
                value={paperSize}
                onChange={(e) => onSizeChange?.(e.target.value as PaperSize)}
                className="text-sm font-bold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                {Object.keys(PAPER_SIZES).map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => onOrientationChange?.('portrait')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${orientation === 'portrait' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Portrait
              </button>
              <button 
                onClick={() => onOrientationChange?.('landscape')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${orientation === 'landscape' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Landscape
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 hover:bg-white rounded-md transition-all text-gray-500 disabled:opacity-30"
                title="Undo"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 hover:bg-white rounded-md transition-all text-gray-500 disabled:opacity-30"
                title="Redo"
              >
                <RotateCw size={16} />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
              <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 hover:bg-white rounded transition-all text-gray-500">
                <ZoomOut size={16} />
              </button>
              <span className="text-[10px] font-black w-10 text-center text-gray-600">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:bg-white rounded transition-all text-gray-500">
                <ZoomIn size={16} />
              </button>
            </div>
            
            <button 
              onClick={clearCanvas}
              className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-500"
              title="Clear Canvas"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={printCanvas}
              className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm active:scale-95"
            >
              <Printer size={18} />
              Print
            </button>
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Object Toolbar (Floating) */}
        <AnimatePresence>
          {fabricCanvasRef.current && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl flex items-center gap-2 z-30"
            >
              <button 
                onClick={addText}
                className="p-3 hover:bg-indigo-50 rounded-xl text-gray-600 hover:text-indigo-600 transition-all flex flex-col items-center gap-1"
                title="Add Text"
              >
                <Type size={20} />
                <span className="text-[10px] font-bold">Text</span>
              </button>
              
              <label className="p-3 hover:bg-indigo-50 rounded-xl text-gray-600 hover:text-indigo-600 transition-all flex flex-col items-center gap-1 cursor-pointer">
                <ImageIcon size={20} />
                <span className="text-[10px] font-bold">Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={addImage} />
              </label>

              {selectedObject && (
                <>
                  <div className="w-px h-8 bg-gray-200 mx-2" />
                  <button 
                    onClick={() => rotateSelected(-90)}
                    className="p-3 hover:bg-indigo-50 rounded-xl text-gray-600 hover:text-indigo-600 transition-all flex flex-col items-center gap-1"
                    title="Rotate Left"
                  >
                    <RotateCcw size={20} />
                    <span className="text-[10px] font-bold">Rotate</span>
                  </button>
                  <button 
                    onClick={() => rotateSelected(90)}
                    className="p-3 hover:bg-indigo-50 rounded-xl text-gray-600 hover:text-indigo-600 transition-all flex flex-col items-center gap-1"
                    title="Rotate Right"
                  >
                    <RotateCw size={20} />
                    <span className="text-[10px] font-bold">Rotate</span>
                  </button>
                  <button 
                    onClick={deleteSelected}
                    className="p-3 hover:bg-red-50 rounded-xl text-gray-600 hover:text-red-600 transition-all flex flex-col items-center gap-1"
                    title="Delete Selected"
                  >
                    <Plus size={20} className="rotate-45" />
                    <span className="text-[10px] font-bold">Delete</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-12 flex justify-center items-start bg-[#f3f4f6]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-200"
          >
            <canvas ref={canvasRef} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
