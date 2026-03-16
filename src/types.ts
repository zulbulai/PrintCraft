export type PaperSize = 'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom';
export type LayoutType = 'lined' | 'grid' | 'dots' | 'staff' | 'cross';

export interface PaperDimensions {
  width: number; // in mm
  height: number; // in mm
}

export const PAPER_SIZES: Record<PaperSize, PaperDimensions> = {
  'A4': { width: 210, height: 297 },
  'A5': { width: 148, height: 210 },
  'Letter': { width: 215.9, height: 279.4 },
  'Legal': { width: 215.9, height: 355.6 },
  'Custom': { width: 210, height: 297 }, // Default to A4
};

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  canvasData: string;
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  isPremium: boolean;
}

export interface UserDesign {
  id: string;
  userId: string;
  name: string;
  canvasData: string;
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  lastModified: any;
}
