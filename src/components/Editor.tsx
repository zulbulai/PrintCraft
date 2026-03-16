import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import { PaperSize, PAPER_SIZES } from '../types';
import { Download, Type, Square, Circle, Minus, Image as ImageIcon, Trash2, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface EditorProps {
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  initialData?: string;
}

export const Editor: React.FC<EditorProps> = ({ paperSize, orientation, initialData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(1);

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
    });

    fabricCanvasRef.current = canvas;

    if (initialData) {
      canvas.loadFromJSON(initialData).then(() => {
        canvas.renderAll();
      });
    }

    // Add a default watermark (non-selectable)
    const watermark = new fabric.IText('Follow @jitendrauno', {
      left: pxWidth / 2,
      top: pxHeight - 40,
      fontSize: 14,
      fill: 'rgba(0,0,0,0.3)',
      originX: 'center',
      selectable: false,
      evented: false,
    });
    canvas.add(watermark);

    return () => {
      canvas.dispose();
    };
  }, [paperSize, orientation, initialData]);

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.IText('Type here...', {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 20,
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const addRect = () => {
    if (!fabricCanvasRef.current) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#000',
      strokeWidth: 2,
      width: 100,
      height: 100,
    });
    fabricCanvasRef.current.add(rect);
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#000',
      strokeWidth: 2,
      radius: 50,
    });
    fabricCanvasRef.current.add(circle);
  };

  const addLine = () => {
    if (!fabricCanvasRef.current) return;
    const line = new fabric.Line([50, 50, 200, 50], {
      stroke: '#000',
      strokeWidth: 2,
    });
    fabricCanvasRef.current.add(line);
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    fabricCanvasRef.current.remove(...activeObjects);
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
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
      multiplier: 3, // High quality
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    pdf.save(`printcraft-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex gap-2">
          <button onClick={addText} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Add Text">
            <Type size={20} />
          </button>
          <button onClick={addRect} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Add Rectangle">
            <Square size={20} />
          </button>
          <button onClick={addCircle} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Add Circle">
            <Circle size={20} />
          </button>
          <button onClick={addLine} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Add Line">
            <Minus size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <button onClick={deleteSelected} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete Selected">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 hover:bg-white rounded transition-colors">
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 hover:bg-white rounded transition-colors">
              <ZoomIn size={16} />
            </button>
          </div>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-12 flex justify-center items-start">
        <div 
          className="canvas-container bg-white"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};
