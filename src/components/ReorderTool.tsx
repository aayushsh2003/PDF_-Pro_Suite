import { useState, useRef } from 'react';
import { Upload, Download, ArrowUpDown } from 'lucide-react';
import { reorderPages, getPDFPageCount, downloadPDF } from '../utils/pdfHelpers';
import ToolHeader from './ToolHeader';

export default function ReorderTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const count = await getPDFPageCount(selectedFile);
      setPageCount(count);
      setPageOrder(Array.from({ length: count }, (_, i) => i));
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...pageOrder];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setPageOrder(newOrder);
    }
  };

  const moveDown = (index: number) => {
    if (index < pageOrder.length - 1) {
      const newOrder = [...pageOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setPageOrder(newOrder);
    }
  };

  const handleReorder = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await reorderPages(file, pageOrder);
      downloadPDF(result, `reordered_${file.name}`);
    } catch (error) {
      console.error('Error reordering pages:', error);
      alert('Error reordering pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ToolHeader
        title="Reorder Pages"
        description="Rearrange pages in any order"
        onBack={onBack}
        icon={ArrowUpDown}
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold mb-1">Click to upload PDF</p>
              <p className="text-slate-500 text-sm">or drag and drop</p>
            </button>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">Selected file:</p>
                <p className="font-semibold text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-600 mt-1">Pages: {pageCount}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Page Order</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pageOrder.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg"
                    >
                      <span className="text-sm font-semibold text-slate-600 min-w-fit">
                        Position {index + 1}:
                      </span>
                      <span className="flex-1 text-sm text-slate-800">Page {page + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === pageOrder.length - 1}
                          className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setFile(null)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={handleReorder}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Apply & Download'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
