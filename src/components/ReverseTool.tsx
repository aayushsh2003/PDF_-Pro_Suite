import { useState } from 'react';
import { ArrowUpDown, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { reversePageOrder, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface ReverseToolProps {
  onBack: () => void;
}

export default function ReverseTool({ onBack }: ReverseToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
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

  const handleReverse = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const reversedPdf = await reversePageOrder(file);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(reversedPdf, `${baseName}_reversed.pdf`);
    } catch (error) {
      console.error('Error reversing PDF:', error);
      alert('Error reversing pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
  };

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Reverse Pages"
        description="Reverse the order of all pages in your PDF"
        icon={<ArrowUpDown className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
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

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Reverse</h3>
                <p className="text-slate-600">
                  This will reverse the order of all {pageCount} page{pageCount !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Current Order</p>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(pageCount, 6) }).map((_, i) => (
                      <div key={i} className="w-10 h-12 bg-white border-2 border-indigo-300 rounded flex items-center justify-center text-xs font-semibold text-indigo-600">
                        {i + 1}
                      </div>
                    ))}
                    {pageCount > 6 && <span className="text-slate-500 self-center">...</span>}
                  </div>
                </div>

                <ArrowUpDown className="w-8 h-8 text-indigo-600 transform rotate-90" />

                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">After Reverse</p>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(pageCount, 6) }).map((_, i) => (
                      <div key={i} className="w-10 h-12 bg-indigo-100 border-2 border-indigo-400 rounded flex items-center justify-center text-xs font-semibold text-indigo-700">
                        {pageCount - i}
                      </div>
                    ))}
                    {pageCount > 6 && <span className="text-slate-500 self-center">...</span>}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleReverse}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Reverse & Download
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
