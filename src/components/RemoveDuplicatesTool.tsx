import { useState } from 'react';
import { Copy, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { removeDuplicatePages, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface RemoveDuplicatesToolProps {
  onBack: () => void;
}

export default function RemoveDuplicatesTool({ onBack }: RemoveDuplicatesToolProps) {
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

  const handleRemoveDuplicates = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const cleanPdf = await removeDuplicatePages(file);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(cleanPdf, `${baseName}_no_duplicates.pdf`);
    } catch (error) {
      console.error('Error removing duplicates:', error);
      alert('Error removing duplicates. Please try again.');
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
        title="Remove Duplicates"
        description="Remove duplicate pages from your PDF"
        icon={<Copy className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-cyan-600" />
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

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Scan for Duplicates</h3>
                <p className="text-slate-600">
                  This will analyze all {pageCount} page{pageCount !== 1 ? 's' : ''} and remove any that are duplicates
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-cyan-200 mb-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-600">{pageCount}</p>
                    <p className="text-sm text-slate-600 mt-1">Original Pages</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                      <p className="text-3xl font-bold text-slate-400">?</p>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">After Cleaning</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleRemoveDuplicates}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Analyze & Download
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Duplicates are identified by comparing page dimensions. Pages with identical width and height are considered duplicates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
