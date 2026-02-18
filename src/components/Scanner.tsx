import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, FileText, Trash2, Download, Plus, X, RotateCw, Crop, ArrowLeft } from 'lucide-react';
import { createPDFFromImages } from '../utils/pdfScanner';

interface ScannedPage {
  id: string;
  dataUrl: string;
  thumbnail: string;
}

interface ScannerProps {
  onBack?: () => void;
}

export default function Scanner({ onBack }: ScannerProps) {
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File): Promise<ScannedPage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          const maxWidth = 1200;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const fullDataUrl = canvas.toDataURL('image/jpeg', 0.9);

          const thumbCanvas = document.createElement('canvas');
          const thumbCtx = thumbCanvas.getContext('2d');
          if (!thumbCtx) {
            reject(new Error('Could not get thumbnail context'));
            return;
          }

          const thumbWidth = 150;
          const thumbHeight = (img.height / img.width) * thumbWidth;
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;
          thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
          const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

          resolve({
            id: Date.now().toString() + Math.random(),
            dataUrl: fullDataUrl,
            thumbnail: thumbnailUrl,
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const newPages: ScannedPage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const page = await processImage(file);
          newPages.push(page);
        }
      }
      setPages([...pages, ...newPages]);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setIsProcessing(false);
      setCaptureMode(null);
    }
  };

  const handleCameraCapture = () => {
    setCaptureMode('camera');
    cameraInputRef.current?.click();
  };

  const handleUpload = () => {
    setCaptureMode('upload');
    fileInputRef.current?.click();
  };

  const removePage = (id: string) => {
    setPages(pages.filter(page => page.id !== id));
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPages.length) return;
    [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
    setPages(newPages);
  };

  const handleGeneratePDF = async () => {
    if (pages.length === 0) return;

    setIsProcessing(true);
    try {
      await createPDFFromImages(pages.map(p => p.dataUrl), 'scanned-document.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to remove all pages?')) {
      setPages([]);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-700" />
                </button>
              )}
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">PDF Scanner</h1>
                <p className="text-slate-600 mt-1">Scan documents and create PDFs</p>
              </div>
            </div>
            {pages.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
                  {pages.length} page{pages.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearAll}
                  disabled={isProcessing}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {pages.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <Camera className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Start Scanning</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Capture photos with your camera or upload images to create a PDF document
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleCameraCapture}
                disabled={isProcessing}
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                <Camera className="w-6 h-6" />
                Open Camera
              </button>
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                <ImageIcon className="w-6 h-6" />
                Upload Images
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Scanned Pages</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleCameraCapture}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Camera
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Upload
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="relative group bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all"
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={page.thumbnail}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <button
                          onClick={() => removePage(page.id)}
                          disabled={isProcessing}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                      {index + 1}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          onClick={() => movePage(index, 'up')}
                          disabled={isProcessing}
                          className="p-1 bg-white text-slate-700 rounded shadow-md hover:bg-slate-100 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      )}
                      {index < pages.length - 1 && (
                        <button
                          onClick={() => movePage(index, 'down')}
                          disabled={isProcessing}
                          className="p-1 bg-white text-slate-700 rounded shadow-md hover:bg-slate-100 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4 border-t border-slate-200">
                <button
                  onClick={handleGeneratePDF}
                  disabled={isProcessing || pages.length === 0}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  <Download className="w-6 h-6" />
                  {isProcessing ? 'Generating...' : 'Generate PDF'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> You can reorder pages by clicking the up/down arrows when hovering over a page thumbnail.
              </p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-slate-800">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
