import { useState, useRef } from 'react';
import { Upload, Download, Crop } from 'lucide-react';
import { cropPages, getPDFPageCount, downloadPDF } from '../utils/pdfHelpers';
import ToolHeader from './ToolHeader';

export default function CropTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [cropMargin, setCropMargin] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const count = await getPDFPageCount(selectedFile);
      setPageCount(count);
    }
  };

  const handleCropPDF = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await cropPages(file, cropMargin);
      downloadPDF(result, `cropped_${file.name}`);
    } catch (error) {
      console.error('Error cropping PDF:', error);
      alert('Error cropping PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ToolHeader
        title="Crop Pages"
        description="Remove margins and crop pages"
        onBack={onBack}
        icon={Crop}
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Crop Margin (pixels): {cropMargin}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropMargin}
                    onChange={(e) => setCropMargin(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Higher values remove more content from edges
                  </p>
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
                  onClick={handleCropPDF}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Crop PDF'}
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
