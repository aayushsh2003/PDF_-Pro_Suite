import { useState } from 'react';
import { Palette, Download, FileText, Loader2 } from 'lucide-react';
import ToolHeader from './ToolHeader';
import FileUpload from './FileUpload';
import { convertToGrayscale, downloadPDF, getPDFPageCount } from '../utils/pdfHelpers';

interface GrayscaleToolProps {
  onBack: () => void;
}

export default function GrayscaleTool({ onBack }: GrayscaleToolProps) {
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

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const grayscalePdf = await convertToGrayscale(file);
      const baseName = file.name.replace('.pdf', '');
      downloadPDF(grayscalePdf, `${baseName}_grayscale.pdf`);
    } catch (error) {
      console.error('Error converting to grayscale:', error);
      alert('Error converting to grayscale. Please try again.');
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
        title="Convert to Grayscale"
        description="Convert your PDF to grayscale/black and white"
        icon={<Palette className="w-6 h-6 text-white" />}
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
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-600" />
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

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Convert to Grayscale</h3>
                <p className="text-slate-600">
                  This will convert all colors in your {pageCount}-page PDF to grayscale
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="w-32 h-40 bg-gradient-to-br from-red-200 via-yellow-200 to-blue-200 rounded-lg shadow-lg mb-3 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-700" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Original (Color)</p>
                </div>

                <div className="text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="text-center">
                  <div className="w-32 h-40 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg shadow-lg mb-3 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-700" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Grayscale</p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Convert & Download
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Converting to grayscale can reduce file size and is useful for printing or professional documents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
