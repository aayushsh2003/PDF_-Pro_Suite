import { useState } from 'react';
import { Scissors, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { splitPDF, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface SplitToolProps {
  onBack: () => void;
}

export default function SplitTool({ onBack }: SplitToolProps) {
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

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const splitPdfs = await splitPDF(file);
      const baseName = file.name.replace('.pdf', '');

      splitPdfs.forEach((pdfBytes, index) => {
        downloadPDF(pdfBytes, `${baseName}_page_${index + 1}.pdf`);
      });
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please try again.');
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
        title="Split PDF"
        description="Split a PDF into separate page files"
        icon={<Scissors className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
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

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Split</h3>
                <p className="text-slate-600">
                  This will create {pageCount} separate PDF files, one for each page
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Splitting...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Split & Download All Pages
                    </>
                  )}
                </button>
              </div>

              {isProcessing && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Processing pages... Downloads will start automatically
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Each page will be downloaded as a separate PDF file.
                Make sure to allow multiple downloads in your browser.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
