import { Template } from '../types';

export const STARTER_TEMPLATES: Template[] = [
  {
    id: 'ruled-a4',
    name: 'Standard Ruled Paper',
    category: 'Education',
    thumbnail: 'https://picsum.photos/seed/ruled/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: Array.from({ length: 25 }).map((_, i) => ({
        type: "line",
        version: "5.3.0",
        originX: "left",
        originY: "top",
        left: 40,
        top: 80 + i * 30,
        width: 515,
        height: 0,
        stroke: "#d1d5db",
        strokeWidth: 1,
        strokeDashArray: null,
        strokeLineCap: "butt",
        strokeDashOffset: 0,
        strokeLineJoin: "miter",
        strokeUniform: false,
        strokeMiterLimit: 4,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        shadow: null,
        visible: true,
        backgroundColor: "",
        fillRule: "nonzero",
        paintFirst: "fill",
        globalCompositeOperation: "source-over",
        skewX: 0,
        skewY: 0,
        x1: 0,
        y1: 0,
        x2: 715,
        y2: 0
      }))
    })
  },
  {
    id: 'graph-a4',
    name: 'Graph Paper (5mm)',
    category: 'Education',
    thumbnail: 'https://picsum.photos/seed/graph/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: [
        ...Array.from({ length: 60 }).map((_, i) => ({
          type: "line",
          left: 0,
          top: i * 20,
          x1: 0, y1: 0, x2: 800, y2: 0,
          stroke: "#e5e7eb",
          strokeWidth: 0.5,
          selectable: false
        })),
        ...Array.from({ length: 40 }).map((_, i) => ({
          type: "line",
          left: i * 20,
          top: 0,
          x1: 0, y1: 0, x2: 0, y2: 1200,
          stroke: "#e5e7eb",
          strokeWidth: 0.5,
          selectable: false
        }))
      ]
    })
  },
  {
    id: 'exam-basic',
    name: 'Basic Exam Paper',
    category: 'Education',
    thumbnail: 'https://picsum.photos/seed/exam/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: [
        { type: "i-text", left: 400, top: 50, text: "SCHOOL/COLLEGE NAME", fontSize: 24, fontWeight: "bold", originX: "center" },
        { type: "i-text", left: 400, top: 90, text: "ANNUAL EXAMINATION 2026", fontSize: 18, originX: "center" },
        { type: "line", left: 50, top: 130, x1: 0, y1: 0, x2: 700, y2: 0, stroke: "#000", strokeWidth: 2 },
        { type: "i-text", left: 50, top: 150, text: "Name: ____________________", fontSize: 14 },
        { type: "i-text", left: 450, top: 150, text: "Roll No: __________", fontSize: 14 },
        { type: "i-text", left: 50, top: 180, text: "Subject: __________________", fontSize: 14 },
        { type: "i-text", left: 450, top: 180, text: "Time: 3 Hours", fontSize: 14 },
        { type: "line", left: 50, top: 210, x1: 0, y1: 0, x2: 700, y2: 0, stroke: "#000", strokeWidth: 1 }
      ]
    })
  },
  {
    id: 'letterhead-modern',
    name: 'Modern Letterhead',
    category: 'Office',
    thumbnail: 'https://picsum.photos/seed/letter/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: [
        { type: "rect", left: 0, top: 0, width: 800, height: 100, fill: "#4f46e5" },
        { type: "i-text", left: 40, top: 30, text: "YOUR COMPANY", fontSize: 32, fill: "#fff", fontWeight: "bold" },
        { type: "i-text", left: 40, top: 70, text: "123 Business Street, City, Country", fontSize: 12, fill: "#fff" },
        { type: "rect", left: 0, top: 1100, width: 800, height: 5, fill: "#4f46e5" }
      ]
    })
  },
  {
    id: 'invoice-simple',
    name: 'Simple Invoice',
    category: 'Office',
    thumbnail: 'https://picsum.photos/seed/invoice/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: [
        { type: "i-text", left: 50, top: 50, text: "INVOICE", fontSize: 40, fontWeight: "bold", fill: "#1e293b" },
        { type: "i-text", left: 600, top: 50, text: "#INV-001", fontSize: 16, originX: "right" },
        { type: "i-text", left: 50, top: 150, text: "Bill To:", fontSize: 14, fontWeight: "bold" },
        { type: "i-text", left: 50, top: 170, text: "Customer Name\nAddress Line 1\nCity, State", fontSize: 12 },
        { type: "rect", left: 50, top: 250, width: 700, height: 40, fill: "#f1f5f9" },
        { type: "i-text", left: 60, top: 260, text: "Description", fontSize: 12, fontWeight: "bold" },
        { type: "i-text", left: 500, top: 260, text: "Qty", fontSize: 12, fontWeight: "bold" },
        { type: "i-text", left: 600, top: 260, text: "Price", fontSize: 12, fontWeight: "bold" },
        { type: "i-text", left: 700, top: 260, text: "Total", fontSize: 12, fontWeight: "bold" }
      ]
    })
  },
  {
    id: 'dot-grid-5mm',
    name: 'Dot Grid (5mm)',
    category: 'Creative',
    thumbnail: 'https://picsum.photos/seed/dot5/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: Array.from({ length: 60 }).flatMap((_, row) => 
        Array.from({ length: 42 }).map((_, col) => ({
          type: "circle",
          left: 20 + col * 18.9, // approx 5mm in pixels
          top: 20 + row * 18.9,
          radius: 1,
          fill: "#9ca3af",
          selectable: false,
          evented: false
        }))
      )
    })
  },
  {
    id: 'dot-grid-10mm',
    name: 'Dot Grid (10mm)',
    category: 'Creative',
    thumbnail: 'https://picsum.photos/seed/dot10/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: Array.from({ length: 30 }).flatMap((_, row) => 
        Array.from({ length: 21 }).map((_, col) => ({
          type: "circle",
          left: 20 + col * 37.8, // approx 10mm in pixels
          top: 20 + row * 37.8,
          radius: 1.5,
          fill: "#9ca3af",
          selectable: false,
          evented: false
        }))
      )
    })
  },
  {
    id: 'dot-grid-3mm',
    name: 'Dot Grid (3mm)',
    category: 'Creative',
    thumbnail: 'https://picsum.photos/seed/dot3/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: Array.from({ length: 100 }).flatMap((_, row) => 
        Array.from({ length: 70 }).map((_, col) => ({
          type: "circle",
          left: 20 + col * 11.3, // approx 3mm in pixels
          top: 20 + row * 11.3,
          radius: 0.8,
          fill: "#d1d5db",
          selectable: false,
          evented: false
        }))
      )
    })
  },
  {
    id: 'dot-grid-iso',
    name: 'Isometric Dot Grid',
    category: 'Creative',
    thumbnail: 'https://picsum.photos/seed/dotiso/300/400',
    paperSize: 'A4',
    orientation: 'portrait',
    isPremium: false,
    canvasData: JSON.stringify({
      version: "5.3.0",
      objects: Array.from({ length: 60 }).flatMap((_, row) => 
        Array.from({ length: 42 }).map((_, col) => ({
          type: "circle",
          left: (row % 2 === 0 ? 20 : 20 + 9.45) + col * 18.9,
          top: 20 + row * 16.3, // Sin(60) * 18.9 approx 16.3
          radius: 1,
          fill: "#9ca3af",
          selectable: false,
          evented: false
        }))
      )
    })
  }
];
