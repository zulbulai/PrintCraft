import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import { PaperSize, PAPER_SIZES } from '../types';
import { Download, Type, Square, Circle, Minus, Trash2, ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize, Eraser, AlignCenter, Image as ImageIcon } from 'lucide-react';

interface EditorProps {
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  initialData?: string;
}

export const Editor: React.FC<EditorProps> = ({ paperSize, orientation, initialData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const MARGIN_MM = 10; // 10mm margin

  const addWatermark = (canvas: fabric.Canvas) => {
    const pxWidth = canvas.getWidth();
    const pxHeight = canvas.getHeight();
    
    // Remove existing watermark if any
    const existing = canvas.getObjects().find(obj => (obj as any).isWatermark);
    if (existing) canvas.remove(existing);

    const watermark = new fabric.IText('Crafted with PrintCraft Pro • Follow @jitendrauno', {
      left: pxWidth / 2,
      top: pxHeight - 25,
      fontSize: 12,
      fill: 'rgba(0,0,0,0.25)',
      fontFamily: 'Inter',
      originX: 'center',
      selectable: false,
      evented: false,
    });
    (watermark as any).isWatermark = true;
    canvas.add(watermark);
    canvas.bringObjectToFront(watermark);
  };

  const addMarginGuides = (canvas: fabric.Canvas) => {
    const pxMargin = (MARGIN_MM * 96) / 25.4;
    const pxWidth = canvas.getWidth();
    const pxHeight = canvas.getHeight();

    // Remove existing guides
    const existing = canvas.getObjects().filter(obj => (obj as any).isGuide);
    canvas.remove(...existing);

    const guideOptions = {
      stroke: '#e2e8f0',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    };

    const topGuide = new fabric.Line([pxMargin, pxMargin, pxWidth - pxMargin, pxMargin], guideOptions);
    const bottomGuide = new fabric.Line([pxMargin, pxHeight - pxMargin, pxWidth - pxMargin, pxHeight - pxMargin], guideOptions);
    const leftGuide = new fabric.Line([pxMargin, pxMargin, pxMargin, pxHeight - pxMargin], guideOptions);
    const rightGuide = new fabric.Line([pxWidth - pxMargin, pxMargin, pxWidth - pxMargin, pxHeight - pxMargin], guideOptions);

    [topGuide, bottomGuide, leftGuide, rightGuide].forEach(g => {
      (g as any).isGuide = true;
      canvas.add(g);
      canvas.sendObjectToBack(g);
    });
  };

  const saveHistory = () => {
    if (!fabricCanvasRef.current) return;
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
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
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    if (initialData) {
      canvas.loadFromJSON(initialData).then(() => {
        addMarginGuides(canvas);
        addWatermark(canvas);
        canvas.renderAll();
        saveHistory();
      });
    } else {
      addMarginGuides(canvas);
      addWatermark(canvas);
      saveHistory();
    }

    canvas.on('object:added', () => {
      const watermark = canvas.getObjects().find(obj => (obj as any).isWatermark);
      if (watermark) canvas.bringObjectToFront(watermark);
    });

    canvas.on('object:modified', saveHistory);

    return () => {
      canvas.dispose();
    };
  }, [paperSize, orientation, initialData]);

  const undo = () => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      const prevIndex = historyIndex - 1;
      fabricCanvasRef.current.loadFromJSON(history[prevIndex]).then(() => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(prevIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
      const nextIndex = historyIndex + 1;
      fabricCanvasRef.current.loadFromJSON(history[nextIndex]).then(() => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(nextIndex);
      });
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.IText('Type here...', {
      left: fabricCanvasRef.current.getWidth() / 2,
      top: fabricCanvasRef.current.getHeight() / 2,
      fontFamily: 'Inter',
      fontSize: 24,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    saveHistory();
  };

  const addRect = () => {
    if (!fabricCanvasRef.current) return;
    const rect = new fabric.Rect({
      left: fabricCanvasRef.current.getWidth() / 2,
      top: fabricCanvasRef.current.getHeight() / 2,
      fill: 'transparent',
      stroke: '#000',
      strokeWidth: 2,
      width: 100,
      height: 100,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvasRef.current.add(rect);
    saveHistory();
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    const circle = new fabric.Circle({
      left: fabricCanvasRef.current.getWidth() / 2,
      top: fabricCanvasRef.current.getHeight() / 2,
      fill: 'transparent',
      stroke: '#000',
      strokeWidth: 2,
      radius: 50,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvasRef.current.add(circle);
    saveHistory();
  };

  const addLine = () => {
    if (!fabricCanvasRef.current) return;
    const line = new fabric.Line([50, 50, 200, 50], {
      stroke: '#000',
      strokeWidth: 2,
      left: fabricCanvasRef.current.getWidth() / 2,
      top: fabricCanvasRef.current.getHeight() / 2,
      originX: 'center',
      originY: 'center',
    });
    fabricCanvasRef.current.add(line);
    saveHistory();
  };

  const centerObject = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.centerObject(activeObject);
      activeObject.setCoords();
      fabricCanvasRef.current.requestRenderAll();
      saveHistory();
    }
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.getObjects().forEach(obj => {
      if (!(obj as any).isWatermark && !(obj as any).isGuide) {
        fabricCanvasRef.current?.remove(obj);
      }
    });
    saveHistory();
    setShowClearConfirm(false);
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    fabricCanvasRef.current.remove(...activeObjects);
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
    saveHistory();
  };

  const exportPDF = () => {
    if (!fabricCanvasRef.current) return;
    
    const dimensions = PAPER_SIZES[paperSize];
    const width = orientation === 'portrait' ? dimensions.width : dimensions.height;
    const height = orientation === 'portrait' ? dimensions.height : dimensions.width;

    const guides = fabricCanvasRef.current.getObjects().filter(obj => (obj as any).isGuide);
    guides.forEach(g => g.set('visible', false));
    fabricCanvasRef.current.renderAll();

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
    pdf.save(`printcraft-${Date.now()}.pdf`);

    guides.forEach(g => g.set('visible', true));
    fabricCanvasRef.current.renderAll();
  };

  const exportImage = () => {
    if (!fabricCanvasRef.current) return;
    
    const guides = fabricCanvasRef.current.getObjects().filter(obj => (obj as any).isGuide);
    guides.forEach(g => g.set('visible', false));
    fabricCanvasRef.current.renderAll();

    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      multiplier: 4,
    });

    const link = document.createElement('a');
    link.download = `printcraft-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    guides.forEach(g => g.set('visible', true));
    fabricCanvasRef.current.renderAll();
  };

  const [showExportOptions, setShowExportOptions] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b shadow-sm z-10">
        <div className="flex items-center gap-1">
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl mr-2">
            <button onClick={addText} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-700" title="Add Text">
              <Type size={18} />
            </button>
            <button onClick={addRect} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-700" title="Add Rectangle">
              <Square size={18} />
            </button>
            <button onClick={addCircle} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-700" title="Add Circle">
              <Circle size={18} />
            </button>
            <button onClick={addLine} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-700" title="Add Line">
              <Minus size={18} />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl mr-2">
            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-700 disabled:opacity-30" title="Undo">
              <RotateCcw size={18} />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-700 disabled:opacity-30" title="Redo">
              <RotateCw size={18} />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
            <button onClick={centerObject} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-700" title="Center Object">
              <AlignCenter size={18} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowClearConfirm(!showClearConfirm)} 
                className={`p-2 rounded-lg transition-all ${showClearConfirm ? 'bg-red-100 text-red-600' : 'hover:bg-white hover:shadow-sm text-slate-700'}`} 
                title="Clear All"
              >
                <Eraser size={18} />
              </button>
              {showClearConfirm && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                  <p className="text-[10px] font-bold text-slate-900 mb-2">Clear entire canvas?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={clearCanvas}
                      className="flex-1 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700"
                    >
                      Yes, Clear
                    </button>
                    <button 
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={deleteSelected} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all" title="Delete Selected">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm">
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] font-bold w-10 text-center text-slate-500">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm">
              <ZoomIn size={16} />
            </button>
            <button onClick={() => setZoom(0.8)} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm" title="Reset Zoom">
              <Maximize size={16} />
            </button>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-100"
            >
              <Download size={18} />
              Export
            </button>
            {showExportOptions && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <button 
                  onClick={() => { exportPDF(); setShowExportOptions(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2"
                >
                  <Download size={16} className="text-indigo-600" />
                  Save as PDF
                </button>
                <button 
                  onClick={() => { exportImage(); setShowExportOptions(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2"
                >
                  <ImageIcon size={16} className="text-indigo-600" />
                  Save as Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center scrollbar-hide">
        <div 
          className="canvas-shadow bg-white transition-transform duration-200 mb-8"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <canvas ref={canvasRef} />
        </div>

        {/* Quick Tips */}
        <div className="max-w-2xl w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-12">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">?</span>
            Quick Tips for Better Design
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-1 h-full bg-indigo-500 rounded-full" />
              <div>
                <p className="text-xs font-bold text-slate-700">Stay inside guides</p>
                <p className="text-[10px] text-slate-500">Keep important text inside the dashed lines to ensure it doesn't get cut during printing.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 h-full bg-emerald-500 rounded-full" />
              <div>
                <p className="text-xs font-bold text-slate-700">Use High Quality</p>
                <p className="text-[10px] text-slate-500">Our PDF export uses 4x resolution for crystal clear prints on any home or office printer.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 h-full bg-amber-500 rounded-full" />
              <div>
                <p className="text-xs font-bold text-slate-700">Keyboard Shortcuts</p>
                <p className="text-[10px] text-slate-500">Use Backspace or Delete key to remove selected items quickly.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 h-full bg-blue-500 rounded-full" />
              <div>
                <p className="text-xs font-bold text-slate-700">Auto-Centering</p>
                <p className="text-[10px] text-slate-500">Use the center icon to perfectly align any object to the middle of the page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .canvas-shadow {
          box-shadow: 0 20px 50px -12px rgb(0 0 0 / 0.15);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
