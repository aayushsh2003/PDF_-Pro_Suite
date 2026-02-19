import { useState, useRef } from 'react';
import { Upload, Download, Zap, X } from 'lucide-react';
import { rotatePDF, addWatermark, getPDFPageCount, downloadPDF } from '../utils/pdfHelpers';
import ToolHeader from './ToolHeader';

export default function BatchTool({ onBack }: { onBack: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rotation, setRotation] = useState(0);
  const [addWatermarkFlag, setAddWatermarkFlag] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleBatchProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      for (let i = 0; i < files.length; i++) {
        let result = new Uint8Array(await files[i].arrayBuffer());

        if (rotation !== 0) {
          result = await rotatePDF(files[i], rotation);
        }

        if (addWatermarkFlag && watermarkText) {
          const tempFile = new File([result], files[i].name);
          result = await addWatermark(tempFile, watermarkText, watermarkOpacity);
        }

        downloadPDF(result, `processed_${files[i].name}`);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasOperations = rotation !== 0 || (addWatermarkFlag && watermarkText);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ToolHeader
        title="Batch Process"
        description="Apply operations to multiple PDFs at once"
        onBack={onBack}
        icon={Zap}
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="space-y-6">
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold mb-1">Click to add PDFs</p>
                <p className="text-slate-500 text-sm">Select multiple files to process</p>
              </button>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Files ({files.length})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                    >
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <p className="text-sm font-semibold text-slate-700">Operations</p>

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

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addWatermarkFlag}
                    onChange={(e) => setAddWatermarkFlag(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-slate-700">Add Watermark</span>
                </label>
              </div>

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
            </div>

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

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
