import { useState, useRef } from 'react';
import { Upload, Download, BookMarked } from 'lucide-react';
import { addHeader, addFooter, getPDFPageCount, downloadPDF } from '../utils/pdfHelpers';
import ToolHeader from './ToolHeader';

export default function HeaderFooterTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- File Select ----------
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);

    try {
      const count = await getPDFPageCount(selectedFile);
      setPageCount(count);
    } catch {
      alert('Invalid or corrupted PDF');
      setFile(null);
      setPageCount(0);
    }

    // allow same file reupload
    e.target.value = '';
  };

  // ---------- Drag & Drop ----------
  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file');
      return;
    }

    setFile(droppedFile);

    try {
      const count = await getPDFPageCount(droppedFile);
      setPageCount(count);
    } catch {
      alert('Invalid or corrupted PDF');
      setFile(null);
      setPageCount(0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  // ---------- Add Header & Footer ----------
  const handleAddHeaderFooter = async () => {
    if (!file || (!headerText && !footerText) || isProcessing) return;

    setIsProcessing(true);

    try {
      let workingFile: File = file;

      // STEP 1: header
      if (headerText.trim()) {
        const headerResult = await addHeader(workingFile, headerText.trim());
        workingFile = new File([headerResult], file.name, { type: 'application/pdf' });
      }

      // STEP 2: footer (applied on already header-modified PDF)
      if (footerText.trim()) {
        const footerResult = await addFooter(workingFile, footerText.trim());
        workingFile = new File([footerResult], file.name, { type: 'application/pdf' });
      }

      // final download
      const finalBytes = await workingFile.arrayBuffer();
      downloadPDF(new Uint8Array(finalBytes), `document_${file.name}`);

    } catch (error) {
      console.error('Error adding header/footer:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      <ToolHeader
        title="Add Header & Footer"
        description="Add header and footer text to all pages"
        onBack={onBack}
        icon={<BookMarked className="w-6 h-6 text-white" />}
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold mb-1">Click to upload PDF</p>
              <p className="text-slate-500 text-sm">or drag and drop PDF here</p>
            </button>
          ) : (
            <div className="space-y-6">

              {/* File Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">Selected file:</p>
                <p className="font-semibold text-slate-800 break-all">{file.name}</p>
                <p className="text-sm text-slate-600 mt-1">Pages: {pageCount}</p>
              </div>

              {/* Header Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Header Text (optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter header text..."
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Footer Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Footer Text (optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter footer text..."
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Header appears at top and footer at bottom of every page.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setPageCount(0);
                    setHeaderText('');
                    setFooterText('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Change File
                </button>

                <button
                  onClick={handleAddHeaderFooter}
                  disabled={isProcessing || (!headerText.trim() && !footerText.trim())}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Apply & Download'}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}