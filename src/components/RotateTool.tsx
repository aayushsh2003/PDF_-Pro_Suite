import { useState } from 'react';
import { RotateCw, RotateCcw, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { rotatePDF, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface RotateToolProps {
  onBack: () => void;
}

export default function RotateTool({ onBack }: RotateToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setRotation(0);
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

  const handleRotate = (degrees: number) => {
    setRotation((rotation + degrees) % 360);
  };

  const handleDownload = async () => {
    if (!file || rotation === 0) return;

    setIsProcessing(true);
    try {
      const rotatedPdf = await rotatePDF(file, rotation);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(rotatedPdf, `${baseName}_rotated.pdf`);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Error rotating PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setRotation(0);
  };

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Rotate PDF"
        description="Rotate all pages in your PDF document"
        icon={<RotateCw className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
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

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Rotate Pages</h3>
                <p className="text-slate-600">Choose rotation angle for all pages</p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => handleRotate(-90)}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-xl hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <RotateCcw className="w-10 h-10 text-orange-600" />
                  <span className="font-semibold text-slate-700">Rotate Left</span>
                  <span className="text-sm text-slate-500">90° CCW</span>
                </button>

                <div className="flex flex-col items-center gap-2 px-6">
                  <div
                    className="w-32 h-40 bg-white rounded-lg shadow-lg border-2 border-orange-300 flex items-center justify-center transition-transform duration-300"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <FileText className="w-12 h-12 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 mt-2">
                    {rotation === 0 ? 'Original' : `${rotation}°`}
                  </span>
                </div>

                <button
                  onClick={() => handleRotate(90)}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-xl hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <RotateCw className="w-10 h-10 text-orange-600" />
                  <span className="font-semibold text-slate-700">Rotate Right</span>
                  <span className="text-sm text-slate-500">90° CW</span>
                </button>
              </div>

              {rotation !== 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Download Rotated PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {rotation === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Use the buttons above to rotate all pages in the document
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
