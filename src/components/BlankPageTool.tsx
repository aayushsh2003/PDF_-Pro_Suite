import { useState } from 'react';
import { FilePlus, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { insertBlankPages, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface BlankPageToolProps {
  onBack: () => void;
}

export default function BlankPageTool({ onBack }: BlankPageToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>('');
  const [positions, setPositions] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setPageInput('');
    setPositions([]);
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
      const pageNum = parseInt(trimmed);
      if (!isNaN(pageNum) && pageNum >= 0 && pageNum <= pageCount && !pages.includes(pageNum)) {
        pages.push(pageNum);
      }
    }

    return pages.sort((a, b) => a - b);
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const pages = parsePageInput(value);
    setPositions(pages);
  };

  const handleInsert = async () => {
    if (!file || positions.length === 0) return;

    setIsProcessing(true);
    try {
      const modifiedPdf = await insertBlankPages(file, positions);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(modifiedPdf, `${baseName}_with_blanks.pdf`);
    } catch (error) {
      console.error('Error inserting blank pages:', error);
      alert('Error inserting blank pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setPageInput('');
    setPositions([]);
  };

  return (
    <div className="min-h-screen">
      <ToolHeader
        title="Insert Blank Pages"
        description="Add blank pages at specific positions in your PDF"
        icon={<FilePlus className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-600" />
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

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Insert Blank Pages</h3>
                <p className="text-slate-600">
                  Enter positions where you want to insert blank pages (0 = before first page, {pageCount} = after last page)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Insertion Positions
                </label>
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => handlePageInputChange(e.target.value)}
                  placeholder="e.g., 0, 2, 5"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed text-lg"
                />
              </div>

              {positions.length > 0 && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-amber-200">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Will insert {positions.length} blank page{positions.length !== 1 ? 's' : ''} at:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {positions.map((pos) => (
                        <span
                          key={pos}
                          className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium"
                        >
                          Position {pos}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-200">
                    Result: {pageCount + positions.length} total pages
                  </p>
                </div>
              )}

              {positions.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleInsert}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Insert & Download
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700 mb-2">
                <strong>How to use:</strong>
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Position 0 inserts a blank page before the first page</li>
                <li>Position 1 inserts a blank page between page 1 and 2</li>
                <li>Position {pageCount} inserts a blank page after the last page</li>
                <li>Separate multiple positions with commas: 0, 2, 5</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
