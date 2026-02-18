import { useState } from 'react';
import { Trash2, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { deletePDFPages, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface DeleteToolProps {
  onBack: () => void;
}

export default function DeleteTool({ onBack }: DeleteToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>('');
  const [pagesToDelete, setPageToDelete] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setPageInput('');
    setPageToDelete([]);
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

  const parsePageInput = (input: string): number[] => {
    const pages: number[] = [];
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= pageCount && !pages.includes(i)) {
              pages.push(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageCount && !pages.includes(pageNum)) {
          pages.push(pageNum);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const pages = parsePageInput(value);
    setPageToDelete(pages);
  };

  const handleDelete = async () => {
    if (!file || pagesToDelete.length === 0) return;

    setIsProcessing(true);
    try {
      const modifiedPdf = await deletePDFPages(file, pagesToDelete);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(modifiedPdf, `${baseName}_deleted.pdf`);
    } catch (error) {
      console.error('Error deleting pages:', error);
      alert('Error deleting pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setPageInput('');
    setPageToDelete([]);
  };

  const remainingPages = pageCount - pagesToDelete.length;

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Delete Pages"
        description="Remove unwanted pages from your PDF"
        icon={<Trash2 className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
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

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8 border border-red-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Select Pages to Delete</h3>
                <p className="text-slate-600">
                  Enter page numbers or ranges (e.g., "2, 4-6, 8")
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Page Numbers to Delete
                </label>
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => handlePageInputChange(e.target.value)}
                  placeholder="e.g., 2, 4-6, 8"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed text-lg"
                />
              </div>

              {pagesToDelete.length > 0 && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-red-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Pages to Delete ({pagesToDelete.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pagesToDelete.map((page) => (
                          <span
                            key={page}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-200">
                    Result: {remainingPages} page{remainingPages !== 1 ? 's' : ''} will remain
                  </p>
                </div>
              )}

              {pagesToDelete.length > 0 && remainingPages > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Delete & Download
                      </>
                    )}
                  </button>
                </div>
              )}

              {pagesToDelete.length === pageCount && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700">Cannot delete all pages</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700 mb-2">
                <strong>How to use:</strong>
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Enter individual pages: 2, 4, 5</li>
                <li>Enter page ranges: 4-6, 10-15</li>
                <li>Combine both: 2, 4-6, 8</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
