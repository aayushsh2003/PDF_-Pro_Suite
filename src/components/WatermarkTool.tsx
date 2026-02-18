import { useState } from 'react';
import { Droplet, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { addWatermark, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface WatermarkToolProps {
  onBack: () => void;
}

export default function WatermarkTool({ onBack }: WatermarkToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>('WATERMARK');
  const [opacity, setOpacity] = useState<number>(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setIsAnalyzing(true);

    try {
      const count = await getPDFPageCount(selectedFile);
      setPageCount(count);
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      alert('Error analyzing PDF. Please try again.');
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyWatermark = async () => {
    if (!file || !watermarkText) return;

    setIsProcessing(true);
    try {
      const watermarkedPdf = await addWatermark(file, watermarkText, opacity);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(watermarkedPdf, `${baseName}_watermarked.pdf`);
    } catch (error) {
      console.error('Error adding watermark:', error);
      alert('Error adding watermark. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setWatermarkText('WATERMARK');
    setOpacity(30);
  };

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Add Watermark"
        description="Add a watermark to all pages of your PDF"
        icon={<Droplet className="w-6 h-6 text-white" />}
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!file ? (
          <>
            <FileUpload onFilesSelected={handleFileSelected} multiple={false} disabled={isAnalyzing} />
            {isAnalyzing && (
              <div className="mt-8 flex items-center justify-center gap-3 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing PDF...</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{file.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB • {pageCount} pages
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change File
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Watermark Settings</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    disabled={isProcessing}
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed text-lg"
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Opacity: {opacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    disabled={isProcessing}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Transparent</span>
                    <span>Opaque</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-purple-300 mb-6 h-48 flex items-center justify-center overflow-hidden">
                  <div
                    className="text-5xl font-bold text-gray-500 transform -rotate-45 select-none"
                    style={{ opacity: opacity / 100 }}
                  >
                    {watermarkText}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleApplyWatermark}
                  disabled={isProcessing || !watermarkText}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Apply & Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
