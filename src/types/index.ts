export interface PDFFile {
  id: string;
  file: File;
  name: string;
  pages?: number;
  preview?: string;
}

export type ToolType = 'merge' | 'split' | 'rotate' | 'extract' | 'reorder' | 'compress' | 'delete' | 'duplicate' | 'watermark' | 'remove-duplicates' | 'reverse' | 'page-numbers' | 'grayscale' | 'metadata' | 'blank-pages' | 'crop' | 'optimize' | 'header-footer' | 'batch' | 'reorder-advanced';
