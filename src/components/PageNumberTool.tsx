import { useState } from 'react';
import { Hash, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { addPageNumbers, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface PageNumberToolProps {
  onBack: () => void;
}

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export default function PageNumberTool({ onBack }: PageNumberToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startNumber, setStartNumber] = useState<number>(1);
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

  const handleAddNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const numberedPdf = await addPageNumbers(file, position, startNumber);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(numberedPdf, `${baseName}_numbered.pdf`);
    } catch (error) {
      console.error('Error adding page numbers:', error);
      alert('Error adding page numbers. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setPosition('bottom-center');
    setStartNumber(1);
  };

  const positions: { value: Position; label: string }[] = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Add Page Numbers"
        description="Add page numbers to your PDF document"
        icon={<Hash className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600" />
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

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-200">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Page Number Settings</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Position
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        disabled={isProcessing}
                        className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                          position === pos.value
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed text-lg"
                  />
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-emerald-300 mb-6 relative h-64 flex items-center justify-center overflow-hidden">
                  <div className="w-40 h-56 bg-slate-50 border-2 border-slate-300 rounded-lg shadow-md relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-slate-300" />
                    </div>
                    <div
                      className={`absolute text-sm font-semibold text-slate-600 ${
                        position.startsWith('top') ? 'top-2' : 'bottom-2'
                      } ${
                        position.includes('left')
                          ? 'left-2'
                          : position.includes('right')
                          ? 'right-2'
                          : 'left-1/2 -translate-x-1/2'
                      }`}
                    >
                      {startNumber}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleAddNumbers}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Add Numbers & Download
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
