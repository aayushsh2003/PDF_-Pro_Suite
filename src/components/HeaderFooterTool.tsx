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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const count = await getPDFPageCount(selectedFile);
      setPageCount(count);
    }
  };

  const handleAddHeaderFooter = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      let result = new Uint8Array();

      if (headerText) {
        result = await addHeader(file, headerText);
      }

      if (footerText) {
        const tempFile = new File([result || await file.arrayBuffer()], file.name);
        result = await addFooter(tempFile, footerText);
      }

      if (!headerText && !footerText) {
        alert('Please enter header or footer text');
        setIsProcessing(false);
        return;
      }

      downloadPDF(result, `document_${file.name}`);
    } catch (error) {
      console.error('Error adding header/footer:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ToolHeader
        title="Add Header & Footer"
        description="Add header and footer text to all pages"
        onBack={onBack}
        icon={BookMarked}
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold mb-1">Click to upload PDF</p>
              <p className="text-slate-500 text-sm">or drag and drop</p>
            </button>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">Selected file:</p>
                <p className="font-semibold text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-600 mt-1">Pages: {pageCount}</p>
              </div>

              <div className="space-y-4">
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
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Preview:</strong> Header will appear at top, footer at bottom of each page.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setFile(null)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={handleAddHeaderFooter}
                  disabled={isProcessing || (!headerText && !footerText)}
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
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
