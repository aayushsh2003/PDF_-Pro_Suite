import { useState, useRef } from 'react';
import { Upload, Download, Zap } from 'lucide-react';
import { compressPDF, getPDFPageCount, downloadPDF } from '../utils/pdfHelpers';
import ToolHeader from './ToolHeader';

export default function CompressTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- File Select ----------
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);

    try {
      const count = await getPDFPageCount(selectedFile);
      setPageCount(count);
    } catch {
      alert('Invalid or corrupted PDF');
      setFile(null);
      setPageCount(0);
      setOriginalSize(0);
    }

    // Allow re-uploading same file
    e.target.value = '';
  };

  // ---------- Drag & Drop ----------
  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file');
      return;
    }

    setFile(droppedFile);
    setOriginalSize(droppedFile.size);

    try {
      const count = await getPDFPageCount(droppedFile);
      setPageCount(count);
    } catch {
      alert('Invalid or corrupted PDF');
      setFile(null);
      setPageCount(0);
      setOriginalSize(0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  // ---------- Compress ----------
  const handleCompress = async () => {
    if (!file || isProcessing) return;

    setIsProcessing(true);

    try {
      const result = await compressPDF(file);
      downloadPDF(result, `compressed_${file.name}`);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Error compressing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- Helpers ----------
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      <ToolHeader
        title="Compress PDF"
        description="Reduce file size while maintaining quality"
        onBack={onBack}
        icon={<Zap className="w-6 h-6 text-white" />}
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold mb-1">
                Click to upload PDF
              </p>
              <p className="text-slate-500 text-sm">
                or drag and drop PDF here
              </p>
            </button>
          ) : (
            <div className="space-y-6">

              {/* File Info */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Selected file:</p>
                  <p className="font-semibold text-slate-800 break-all">
                    {file.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">File Size</p>
                    <p className="font-semibold text-slate-800">
                      {formatBytes(originalSize)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Pages</p>
                    <p className="font-semibold text-slate-800">
                      {pageCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Compression removes unnecessary embedded data and optimizes
                  internal structure to make the PDF easier to share via email
                  or upload to websites.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setPageCount(0);
                    setOriginalSize(0);
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Change File
                </button>

                <button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  {isProcessing ? 'Compressing...' : 'Compress & Download'}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}