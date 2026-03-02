import { useState, useRef } from 'react';
import { Upload, Download, Zap, X } from 'lucide-react';
import { rotatePDF, addWatermark, downloadPDF } from '../utils/pdfHelpers';
import ToolHeader from './ToolHeader';

export default function BatchTool({ onBack }: { onBack: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rotation, setRotation] = useState(0);
  const [addWatermarkFlag, setAddWatermarkFlag] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Add Files ----------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');

    if (pdfFiles.length !== selectedFiles.length) {
      alert('Only PDF files are allowed');
    }

    setFiles(prev => [...prev, ...pdfFiles]);

    // allow reselecting same files
    e.target.value = '';
  };

  // ---------- Drag & Drop ----------
  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    const pdfFiles = droppedFiles.filter(f => f.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      alert('Please drop PDF files only');
      return;
    }

    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  // ---------- Remove File ----------
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // ---------- Batch Process ----------
  const handleBatchProcess = async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);

    try {
      for (let i = 0; i < files.length; i++) {
        let workingFile: File = files[i];

        // STEP 1: Rotate
        if (rotation !== 0) {
          const rotated = await rotatePDF(workingFile, rotation);
          workingFile = new File([rotated], workingFile.name, { type: 'application/pdf' });
        }

        // STEP 2: Watermark (applied on rotated version)
        if (addWatermarkFlag && watermarkText.trim()) {
          const watermarked = await addWatermark(
            workingFile,
            watermarkText.trim(),
            watermarkOpacity
          );
          workingFile = new File([watermarked], workingFile.name, { type: 'application/pdf' });
        }

        // FINAL DOWNLOAD
        const finalBytes = await workingFile.arrayBuffer();
        downloadPDF(new Uint8Array(finalBytes), `processed_${workingFile.name}`);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasOperations = rotation !== 0 || (addWatermarkFlag && watermarkText.trim());

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      <ToolHeader
        title="Batch Process"
        description="Apply operations to multiple PDFs at once"
        onBack={onBack}
        icon={<Zap className="w-6 h-6 text-white" />}
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          {/* Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold mb-1">Click to add PDFs</p>
            <p className="text-slate-500 text-sm">or drag & drop multiple PDFs</p>
          </button>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3 mt-6">
              <p className="text-sm font-semibold text-slate-700">
                Files ({files.length})
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                  >
                    <span className="text-sm text-slate-700 break-all">
                      {file.name}
                    </span>

                    <button
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operations */}
          <div className="border-t mt-6 pt-6 space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Rotation: {rotation}°
              </label>

              <input
                type="range"
                min="0"
                max="270"
                step="90"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />

              <div className="flex gap-2 mt-2">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotation(deg)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                      rotation === deg
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addWatermarkFlag}
                onChange={(e) => setAddWatermarkFlag(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-slate-700">
                Add Watermark
              </span>
            </label>

            {addWatermarkFlag && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="Watermark text..."
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Opacity: {watermarkOpacity}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={handleBatchProcess}
              disabled={isProcessing || files.length === 0 || !hasOperations}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Processing...' : 'Process & Download All'}
            </button>

          </div>
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}